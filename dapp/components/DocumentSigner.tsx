'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { PenTool, AlertCircle, CheckCircle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';

interface DocumentSignerProps {
  documentHash: string;
  timestamp: number;
}

export default function DocumentSigner({ documentHash, timestamp }: DocumentSignerProps) {
  const { currentWallet } = useWallet();
  const { storeDocument, isLoading, error } = useContract();
  const [signature, setSignature] = useState<string | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [isStored, setIsStored] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  const handleSign = async () => {
    if (!currentWallet) {
      setStoreError('No wallet connected');
      return;
    }

    if (!documentHash) {
      setStoreError('No document hash generated');
      return;
    }

    try {
      // Sign the document hash with the wallet
      const sig = await currentWallet.signMessage(ethers.getBytes(documentHash));
      setSignature(sig);
      setIsSigned(true);
    } catch (err: any) {
      setStoreError(err.message || 'Failed to sign document');
    }
  };

  const handleStore = async () => {
    if (!signature) {
      setStoreError('Please sign the document first');
      return;
    }

    try {
      await storeDocument(documentHash, timestamp, signature);
      setIsStored(true);
    } catch (err: any) {
      setStoreError(err.message || 'Failed to store document');
    }
  };

  if (!currentWallet) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center text-yellow-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Please connect a wallet first</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Sign & Store Document
      </h2>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Wallet Address:
          </p>
          <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
            {currentWallet.address}
          </p>
        </div>

        {!isSigned ? (
          <button
            onClick={handleSign}
            disabled={!documentHash || isLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <PenTool className="w-5 h-5 mr-2" />
            Sign Document
          </button>
        ) : (
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <div className="flex items-center text-green-600 dark:text-green-400 mb-2">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Document Signed</span>
            </div>
            <p className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
              {signature}
            </p>
          </div>
        )}

        {isSigned && !isStored && (
          <button
            onClick={handleStore}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {isLoading ? 'Storing...' : 'Store on Blockchain'}
          </button>
        )}

        {isStored && (
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Document stored successfully!</span>
            </div>
          </div>
        )}

        {(storeError || error) && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{storeError || error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
