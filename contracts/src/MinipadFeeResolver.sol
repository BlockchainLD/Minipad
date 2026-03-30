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
//
// Deployment:
//   constructor(_eas = 0x4200000000000000000000000000000000000021, _minFee = 3300000000000)
// ──────────────────────────────────────────────────────────────────────────────
contract MinipadFeeResolver is ISchemaResolver {
    // ── State ──────────────────────────────────────────────────────────────────
    address public immutable eas;       // EAS contract on Base mainnet
    address public owner;
    address public pendingOwner;        // two-step ownership transfer
    uint256 public minFee;              // minimum wei per attestation

    // ── Events ─────────────────────────────────────────────────────────────────
    event FeePaid(address indexed payer, bytes32 indexed schema, uint256 amount);
    event Distributed(address indexed creator, address indexed builder, uint256 perRecipient);
    event MinFeeUpdated(uint256 newMinFee);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ── Errors ─────────────────────────────────────────────────────────────────
    error NotOwner();
    error NotPendingOwner();
    error NotEAS();
    error ZeroAddress();
    error FeeTooLow(uint256 sent, uint256 required);
    error InvalidWinnerCount();     // n == 0 or n > 3
    error ArrayLengthMismatch();
    error NothingToDistribute();    // perRecipient rounds to zero
    error EmptyBalance();           // withdraw() called with no balance
    error TransferFailed();

    // ── Modifiers ──────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyEAS() {
        if (msg.sender != eas) revert NotEAS();
        _;
    }

    // ── Constructor ────────────────────────────────────────────────────────────
    constructor(address _eas, uint256 _minFee) {
        if (_eas == address(0)) revert ZeroAddress();
        eas = _eas;
        owner = msg.sender;
        minFee = _minFee;
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
    function attest(Attestation calldata attestation)
        external
        payable
        override
        onlyEAS
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
    function multiAttest(
        Attestation[] calldata attestations,
        uint256[] calldata values
    ) external payable override onlyEAS returns (bool) {
        uint256 len = attestations.length;
        for (uint256 i = 0; i < len; ) {
            if (values[i] < minFee) revert FeeTooLow(values[i], minFee);
            if (values[i] > 0) emit FeePaid(attestations[i].attester, attestations[i].schema, values[i]);
            unchecked { ++i; }
        }
        return true;
    }

    /// @notice Called by EAS on revocation. Revocations are free; any ETH
    ///         forwarded by EAS (from RevocationRequestData.value) stays in
    ///         the fee pool.
    function revoke(Attestation calldata)
        external
        payable
        override
        onlyEAS
        returns (bool)
    {
        return true;
    }

    /// @notice Called by EAS on batch revocation.
    function multiRevoke(Attestation[] calldata, uint256[] calldata)
        external
        payable
        override
        onlyEAS
        returns (bool)
    {
        return true;
    }

    // ── Admin functions ────────────────────────────────────────────────────────

    /// @notice Distribute the full contract balance equally among the top N winners (max 3).
    ///         Each winner slot receives (balance / N), split 50/50 between creator and builder.
    ///         Any integer-division dust is left in the contract for the next cycle.
    ///
    /// @param creators  Wallet addresses of idea creators, ordered by rank.
    /// @param builders  Wallet addresses of builders who completed each idea, same order.
    function distribute(
        address[] calldata creators,
        address[] calldata builders
    ) external onlyOwner {
        uint256 n = creators.length;
        if (n == 0 || n > 3) revert InvalidWinnerCount();
        if (builders.length != n) revert ArrayLengthMismatch();

        uint256 perRecipient = (address(this).balance / n) / 2;
        if (perRecipient == 0) revert NothingToDistribute();

        for (uint256 i = 0; i < n; ) {
            if (creators[i] == address(0) || builders[i] == address(0)) revert ZeroAddress();
            (bool ok1,) = payable(creators[i]).call{value: perRecipient}("");
            if (!ok1) revert TransferFailed();
            (bool ok2,) = payable(builders[i]).call{value: perRecipient}("");
            if (!ok2) revert TransferFailed();
            emit Distributed(creators[i], builders[i], perRecipient);
            unchecked { ++i; }
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
    function withdraw(address payable to) external onlyOwner {
        if (to == address(0)) revert ZeroAddress();
        uint256 balance = address(this).balance;
        if (balance == 0) revert EmptyBalance();
        (bool ok,) = to.call{value: balance}("");
        if (!ok) revert TransferFailed();
    }
}
