'use client';

import { BasePayButton } from "@base-org/account-ui/react";
import { pay } from '@base-org/account';
import { APP_METADATA } from '../lib/utils';
import { toast } from "sonner";

export function BasePay({ amount = '0.01', to = APP_METADATA.baseBuilder.allowedAddresses[0], testnet = false, colorScheme = 'light' }: {
  amount?: string;
  to?: string;
  testnet?: boolean;
  colorScheme?: "light" | "dark" | "system" | undefined;
}) {
  const handlePay = async () => {
    try {
      const payment = await pay({
        amount,
        to,
        testnet
      });
      if(payment.success){
        toast.success(`You paid $${payment.amount}!`);
      }
    } catch (error) {
      toast.error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <BasePayButton colorScheme={colorScheme} onClick={handlePay}
    />
  );
}