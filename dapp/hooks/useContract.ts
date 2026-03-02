'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract';
import { useWallet } from '@/contexts/WalletContext';

interface DocumentInfo {
  documentHash: string;
  timestamp: bigint;
  signer: string;
  signature: string;
}

export function useContract() {
  const { currentWallet, provider } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = useCallback(() => {
    if (!currentWallet) {
      throw new Error('No wallet connected');
    }
    const signer = currentWallet.connect(provider);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, [currentWallet, provider]);

  const getContractReadOnly = useCallback(() => {
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }, [provider]);

  const storeDocument = useCallback(async (
    documentHash: string,
    timestamp: number,
    signature: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = getContract();
      const tx = await contract.storeDocumentHash(
        documentHash,
        timestamp,
        signature,
        currentWallet!.address
      );
      const receipt = await tx.wait();
      return receipt;
    } catch (err: any) {
      setError(err.message || 'Failed to store document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getContract, currentWallet]);

  const verifyDocument = useCallback(async (documentHash: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = getContractReadOnly();
      const isValid = await contract.verifyDocument(documentHash);
      return isValid;
    } catch (err: any) {
      setError(err.message || 'Failed to verify document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getContractReadOnly]);

  const getDocumentInfo = useCallback(async (documentHash: string): Promise<DocumentInfo | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const contract = getContractReadOnly();
      const info = await contract.getDocumentInfo(documentHash);
      return {
        documentHash: info[0],
        timestamp: info[1],
        signer: info[2],
        signature: info[3]
      };
    } catch (err: any) {
      // Document might not exist
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getContractReadOnly]);

  const isDocumentStored = useCallback(async (documentHash: string) => {
    try {
      const contract = getContractReadOnly();
      return await contract.isDocumentStored(documentHash);
    } catch {
      return false;
    }
  }, [getContractReadOnly]);

  const getDocumentCount = useCallback(async () => {
    try {
      const contract = getContractReadOnly();
      return await contract.getDocumentCount();
    } catch {
      return BigInt(0);
    }
  }, [getContractReadOnly]);

  const getDocumentHashByIndex = useCallback(async (index: number) => {
    try {
      const contract = getContractReadOnly();
      return await contract.getDocumentHashByIndex(index);
    } catch {
      return null;
    }
  }, [getContractReadOnly]);

  return {
    storeDocument,
    verifyDocument,
    getDocumentInfo,
    isDocumentStored,
    getDocumentCount,
    getDocumentHashByIndex,
    isLoading,
    error
  };
}
