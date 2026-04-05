'use client';

import { useAccount } from '@gear-js/react-hooks';
import AppLayout from '@/components/app-layout';
import WalletConnect from '@/components/wallet-connect';
import { useState, useEffect } from 'react';

export default function AppRootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { account } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-provn-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
      </div>
    );
  }

  if (!account) {
    return <WalletConnect />;
  }

  return <AppLayout>{children}</AppLayout>;
}
