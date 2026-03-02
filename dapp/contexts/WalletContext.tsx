'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { MNEMONIC, RPC_URL, CHAIN_ID } from '@/lib/contract';

interface WalletContextType {
  wallets: ethers.HDNodeWallet[];
  currentWallet: ethers.HDNodeWallet | null;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isLoading: boolean;
  provider: ethers.JsonRpcProvider;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<ethers.HDNodeWallet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [provider] = useState(() => new ethers.JsonRpcProvider(RPC_URL, {
    chainId: CHAIN_ID,
    name: 'local'
  }));

  useEffect(() => {
    // Derive 10 wallets from Anvil's mnemonic
    const deriveWallets = async () => {
      try {
        const masterNode = ethers.Mnemonic.fromPhrase(MNEMONIC);
        const derivedWallets: ethers.HDNodeWallet[] = [];

        for (let i = 0; i < 10; i++) {
          const wallet = ethers.HDNodeWallet.fromMnemonic(masterNode, `m/44'/60'/0'/0/${i}`);
          derivedWallets.push(wallet);
        }

        setWallets(derivedWallets);
        setIsLoading(false);
      } catch (error) {
        console.error('Error deriving wallets:', error);
        setIsLoading(false);
      }
    };

    deriveWallets();
  }, []);

  const currentWallet = wallets[currentIndex] || null;

  const value: WalletContextType = {
    wallets,
    currentWallet,
    currentIndex,
    setCurrentIndex,
    isLoading,
    provider
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
