// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

// ──────────────────────────────────────────────────────────────────────────────
// EAS types — inlined so no external dependency is required at compile time.
// Source: https://github.com/ethereum-attestation-service/eas-contracts
// ──────────────────────────────────────────────────────────────────────────────

struct Attestation {
    bytes32 uid;
    bytes32 schema;
    uint64 time;
    uint64 expirationTime;
    uint64 revocationTime;
    bytes32 refUID;
    address recipient;
    address attester;
    bool revocable;
    bytes data;
}

interface ISchemaResolver {
    function isPayable() external pure returns (bool);
    function attest(Attestation calldata attestation) external payable returns (bool);
    function multiAttest(Attestation[] calldata attestations, uint256[] calldata values) external payable returns (bool);
    function revoke(Attestation calldata attestation) external payable returns (bool);
    function multiRevoke(Attestation[] calldata attestations, uint256[] calldata values) external payable returns (bool);
}

// ──────────────────────────────────────────────────────────────────────────────
// MinipadFeeResolver
//
// EAS schema resolver that:
//  - Requires a minimum ETH fee on every attestation (IDEA, CLAIM, COMPLETION)
//  - Accumulates fees in contract balance
//  - Lets the owner distribute the full balance to top-N winners (max 3),
//    splitting each winner's share 50/50 between creator and builder
//  - Lets the owner adjust the minimum fee, transfer ownership, or withdraw
//  - Supports an emergency pause on fee collection, with a guardian address
//    that can take over the pause lock to prevent a compromised owner from
//    unpausing (only the guardian can release a guardian-initiated pause)
//
// Roles:
//   owner    — Luciano's wallet. Full admin: fee, distribute, withdraw, ownership,
//              pause/unpause (unless guardian-locked).
//   guardian — Cold/hardware wallet. Can pause at any time and lock out the owner's
//              ability to unpause. Immutable: cannot be changed after deployment.
//
// Deployment:
//   constructor(
//     _eas      = 0x4200000000000000000000000000000000000021,
//     _minFee   = 3300000000000,
//     _guardian = <cold wallet address>
//   )
// ──────────────────────────────────────────────────────────────────────────────
contract MinipadFeeResolver is ISchemaResolver {
    // ── State ──────────────────────────────────────────────────────────────────
    address public immutable eas;       // EAS contract on Base mainnet
    address public immutable guardian;  // Safety address — permanent, cannot be changed
    address public owner;
    address public pendingOwner;        // two-step ownership transfer
    uint256 public minFee;              // minimum wei per attestation
    bool public paused;                 // true → attest/multiAttest revert
    bool public guardianPaused;         // true → only guardian may unpause (readable by dashboard)
    uint256 private _locked;            // reentrancy guard (1 = unlocked, 2 = locked)

    // ── Events ─────────────────────────────────────────────────────────────────
    event FeePaid(address indexed payer, bytes32 indexed schema, uint256 amount);
    event Distributed(address indexed creator, address indexed builder, uint256 perRecipient);
    event Withdrawn(address indexed to, uint256 amount);
    event Paused(address indexed by);
    event Unpaused(address indexed by);
    event MinFeeUpdated(uint256 newMinFee);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ── Errors ─────────────────────────────────────────────────────────────────
    error NotOwner();
    error NotPendingOwner();
    error NotEAS();
    error NotAuthorized();        // caller is neither owner nor guardian
    error ZeroAddress();
    error Reentrancy();
    error FeeTooLow(uint256 sent, uint256 required);
    error InvalidWinnerCount();   // n == 0 or n > 3
    error ArrayLengthMismatch();
    error NothingToDistribute();  // perRecipient rounds to zero
    error EmptyBalance();         // withdraw() called with no balance
    error TransferFailed();
    error ContractPaused();       // attest/multiAttest while paused
    error NotPaused();            // unpause() called when not paused
    error AlreadyPaused();        // pause() called when already paused with no new effect
    error GuardianLocked();       // owner attempting to unpause a guardian-locked pause
    error GuardianEqualsOwner();  // guardian must be a different address from the owner

    // ── Modifiers ──────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyEAS() {
        if (msg.sender != eas) revert NotEAS();
        _;
    }

    modifier nonReentrant() {
        if (_locked == 2) revert Reentrancy();
        _locked = 2;
        _;
        _locked = 1;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    // ── Constructor ────────────────────────────────────────────────────────────
    constructor(address _eas, uint256 _minFee, address _guardian) {
        if (_eas == address(0)) revert ZeroAddress();
        if (_guardian == address(0)) revert ZeroAddress();
        if (_guardian == msg.sender) revert GuardianEqualsOwner();
        eas = _eas;
        guardian = _guardian;
        owner = msg.sender;
        minFee = _minFee;
        _locked = 1;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ── Receive ────────────────────────────────────────────────────────────────

    /// @dev Accept direct ETH from the owner only (e.g. to bootstrap the fee pool).
    ///      All other plain transfers are rejected to prevent accidental sends.
    receive() external payable {
        if (msg.sender != owner) revert NotOwner();
    }

    // ── ISchemaResolver ────────────────────────────────────────────────────────

    /// @notice EAS checks this to know whether to forward ETH to the resolver.
    function isPayable() external pure override returns (bool) {
        return true;
    }

    /// @notice Called by EAS for every single attestation.
    ///         msg.value == AttestationRequestData.value forwarded by EAS.
    ///         Reverts when the contract is paused.
    function attest(Attestation calldata attestation)
        external
        payable
        override
        onlyEAS
        whenNotPaused
        returns (bool)
    {
        if (msg.value < minFee) revert FeeTooLow(msg.value, minFee);
        if (msg.value > 0) emit FeePaid(attestation.attester, attestation.schema, msg.value);
        return true;
    }

    /// @notice Called by EAS for batch attestations (multiAttest).
    ///         values[i] is the per-attestation ETH amount forwarded by EAS;
    ///         EAS guarantees values.length == attestations.length and
    ///         msg.value == sum of non-zero entries in values[].
    ///         Reverts when the contract is paused.
    function multiAttest(
        Attestation[] calldata attestations,
        uint256[] calldata values
    ) external payable override onlyEAS whenNotPaused returns (bool) {
        uint256 len = attestations.length;
        if (values.length != len) revert ArrayLengthMismatch();
        for (uint256 i = 0; i < len; ++i) {
            if (values[i] < minFee) revert FeeTooLow(values[i], minFee);
            if (values[i] > 0) emit FeePaid(attestations[i].attester, attestations[i].schema, values[i]);
        }
        return true;
    }

    /// @notice Called by EAS on revocation. Revocations are always permitted,
    ///         even when paused — revoking an attestation should never be blocked.
    function revoke(Attestation calldata)
        external
        payable
        override
        onlyEAS
        returns (bool)
    {
        return true;
    }

    /// @notice Called by EAS on batch revocation. Always permitted.
    function multiRevoke(Attestation[] calldata, uint256[] calldata)
        external
        payable
        override
        onlyEAS
        returns (bool)
    {
        return true;
    }

    // ── Pause / Unpause ────────────────────────────────────────────────────────

    /// @notice Halt new fee collection. Only attest() and multiAttest() are blocked;
    ///         distribute(), withdraw(), and revocations continue to work.
    ///
    /// Caller behaviour:
    ///   owner    — can pause only when not already paused.
    ///   guardian — can pause at any time. If the contract was already paused by the
    ///              owner, the guardian "takes over" the pause, locking the owner out
    ///              of unpause. This is the key safety property: a compromised owner
    ///              cannot resume operations once the guardian has intervened.
    function pause() external {
        if (msg.sender == guardian) {
            // Guardian is taking control. If guardian lock is already set, nothing to do.
            if (guardianPaused) revert AlreadyPaused();
            // Set paused if it isn't already, then lock it to guardian.
            if (!paused) paused = true;
            guardianPaused = true;
            emit Paused(msg.sender);
        } else if (msg.sender == owner) {
            // Owner can only pause when nothing is already paused.
            if (paused) revert AlreadyPaused();
            paused = true;
            emit Paused(msg.sender);
        } else {
            revert NotAuthorized();
        }
    }

    /// @notice Resume fee collection.
    ///
    /// Caller behaviour:
    ///   guardian — can always unpause, regardless of who triggered the pause.
    ///   owner    — can unpause ONLY when the pause was not triggered or taken over
    ///              by the guardian. Reverts with GuardianLocked otherwise.
    ///   anyone else — reverts NotAuthorized.
    function unpause() external {
        if (!paused) revert NotPaused();
        if (guardianPaused) {
            // Guardian holds the lock — only guardian may release it.
            if (msg.sender != guardian) revert GuardianLocked();
        } else {
            // Standard pause — owner or guardian may release.
            if (msg.sender != owner && msg.sender != guardian) revert NotAuthorized();
        }
        paused = false;
        guardianPaused = false;
        emit Unpaused(msg.sender);
    }

    // ── Admin functions ────────────────────────────────────────────────────────

    /// @notice Distribute the full contract balance equally among the top N winners (max 3).
    ///         Each winner slot receives (balance / N), split 50/50 between creator and builder.
    ///         Any integer-division dust is left in the contract for the next cycle.
    ///         Note: distribute() is intentionally NOT gated by whenNotPaused — accumulated
    ///         fees can always be distributed even if new collection is halted.
    ///
    /// @param creators  Wallet addresses of idea creators, ordered by rank.
    /// @param builders  Wallet addresses of builders who completed each idea, same order.
    function distribute(
        address[] calldata creators,
        address[] calldata builders
    ) external onlyOwner nonReentrant {
        uint256 n = creators.length;
        if (n == 0 || n > 3) revert InvalidWinnerCount();
        if (builders.length != n) revert ArrayLengthMismatch();

        uint256 perRecipient = (address(this).balance / n) / 2;
        if (perRecipient == 0) revert NothingToDistribute();

        for (uint256 i = 0; i < n; ++i) {
            if (creators[i] == address(0) || builders[i] == address(0)) revert ZeroAddress();
            (bool ok1,) = payable(creators[i]).call{value: perRecipient}("");
            if (!ok1) revert TransferFailed();
            (bool ok2,) = payable(builders[i]).call{value: perRecipient}("");
            if (!ok2) revert TransferFailed();
            emit Distributed(creators[i], builders[i], perRecipient);
        }
    }

    /// @notice Update the minimum attestation fee. Effective immediately on new attestations.
    function setMinFee(uint256 _minFee) external onlyOwner {
        minFee = _minFee;
        emit MinFeeUpdated(_minFee);
    }

    /// @notice Step 1 of two-step ownership transfer. Proposes a new owner.
    ///         The new owner must call acceptOwnership() to complete the transfer.
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        if (newOwner == guardian) revert GuardianEqualsOwner();
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /// @notice Step 2 of two-step ownership transfer. Must be called by the pending owner.
    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotPendingOwner();
        emit OwnershipTransferred(owner, pendingOwner);
        owner = pendingOwner;
        pendingOwner = address(0);
    }

    /// @notice Emergency withdrawal of the full contract balance to `to`.
    ///         Intentionally NOT gated by whenNotPaused — funds must always be recoverable.
    function withdraw(address payable to) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        uint256 balance = address(this).balance;
        if (balance == 0) revert EmptyBalance();
        (bool ok,) = to.call{value: balance}("");
        if (!ok) revert TransferFailed();
        emit Withdrawn(to, balance);
    }
}
