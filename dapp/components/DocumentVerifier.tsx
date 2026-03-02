'use client';

import { useState } from 'react';
import { Search, CheckCircle, XCircle, AlertCircle, Copy, Check, Upload, FileText } from 'lucide-react';
import { useContract } from '@/hooks/useContract';
import { useWallet } from '@/contexts/WalletContext';

interface VerificationResult {
  isValid: boolean;
  reason: string;
  documentInfo?: {
    documentHash: string;
    timestamp: bigint;
    signer: string;
    signature: string;
  };
}

export default function DocumentVerifier() {
  const { verifyDocument, getDocumentInfo, isDocumentStored, isLoading, error } = useContract();
  const { wallets } = useWallet();
  
  const [documentHash, setDocumentHash] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  const processAndSetHash = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Dynamic import for ethers
      const { ethers } = await import('ethers');
      const hash = ethers.keccak256(uint8Array);
      
      setDocumentHash(hash);
      setFileName(file.name);
      // Clear previous results when new file is uploaded
      setResult(null);
      setVerifyError(null);
    } catch (err: any) {
      setVerifyError('Failed to process file: ' + (err.message || 'Unknown error'));
    }
  };

  const copyToClipboard = async (address: string, index: number) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleVerify = async () => {
    if (!documentHash) {
      setVerifyError('Please upload a document to verify');
      return;
    }

    setVerifyError(null);
    setResult(null);

    try {
      // Ensure hash is a valid bytes32
      let hash = documentHash.trim();
      if (!hash.startsWith('0x')) {
        hash = '0x' + hash;
      }

      // First check if document exists using isDocumentStored (more reliable)
      const stored = await isDocumentStored(hash);

      if (!stored) {
        setResult({
          isValid: false,
          reason: 'Document not found on blockchain. This document has not been stored yet.'
        });
        return;
      }

      // Document exists, get more details
      const info = await getDocumentInfo(hash);

      if (!info) {
        setResult({
          isValid: false,
          reason: 'Document not found on blockchain. This document has not been stored yet.'
        });
        return;
      }

      // If an address is specified, check if it matches the signer
      if (selectedAddress && selectedAddress !== 'any') {
        const expectedAddress = selectedAddress.toLowerCase();
        const actualSigner = info.signer.toLowerCase();

        if (expectedAddress !== actualSigner) {
          setResult({
            isValid: false,
            reason: `Document exists on blockchain but was signed by a different wallet. Expected signer: ${selectedAddress}, Actual signer: ${info.signer}`,
            documentInfo: info
          });
          return;
        }
      }

      // Document exists and signer matches (or no specific address was selected)
      setResult({
        isValid: true,
        reason: selectedAddress && selectedAddress !== 'any' 
          ? 'Document verified successfully! The document is authentic and was signed by the specified wallet.'
          : 'Document verified successfully! The document is authentic and exists on the blockchain.',
        documentInfo: info
      });
    } catch (err: any) {
      setVerifyError(err.message || 'Failed to verify document');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Verify Document
      </h2>

      <div className="space-y-4">
        {/* File Uploader Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Document to Verify
          </label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  processAndSetHash(file);
                }
              }}
              className="hidden"
              id="verify-file-upload"
            />
            <label
              htmlFor="verify-file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {documentHash ? (
                <div className="w-full">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="w-8 h-8 text-green-500 mr-2" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {fileName}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
                    Hash: {documentHash}
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Hash will be generated automatically
                  </p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Address Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Verify Against Address (Optional)
          </label>
          <div className="relative">
            <button
              onClick={() => setShowAddressDropdown(!showAddressDropdown)}
              className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="font-mono text-sm">
                {selectedAddress 
                  ? selectedAddress === 'any' 
                    ? 'Any Address (Check if document exists)'
                    : `${selectedAddress.slice(0, 10)}...${selectedAddress.slice(-8)}`
                  : 'Select an address to verify against (optional)'
                }
              </span>
              <span className="text-gray-400">▼</span>
            </button>

            {showAddressDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 max-h-60 overflow-y-auto">
                <button
                  onClick={() => {
                    setSelectedAddress('any');
                    setShowAddressDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 ${
                    selectedAddress === 'any' 
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Any Address (Check if document exists)
                </button>
                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                <p className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                  Anvil Wallet Catalog (click to copy)
                </p>
                {wallets.map((wallet, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedAddress(wallet.address);
                      setShowAddressDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between ${
                      selectedAddress === wallet.address
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="font-mono text-xs">
                      <span className="text-gray-400 mr-2">#{index}</span>
                      {wallet.address}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(wallet.address, index);
                      }}
                      className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Select a specific wallet to verify the document was signed by that address
          </p>
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isLoading || !documentHash}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          <Search className="w-5 h-5 mr-2" />
          {isLoading ? 'Verifying...' : 'Verify Document'}
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-300">Verifying...</span>
          </div>
        )}

        {/* Error Message */}
        {verifyError && (
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{verifyError}</span>
          </div>
        )}

        {/* Verified Success */}
        {result?.isValid === true && (
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <div className="flex items-center text-green-600 dark:text-green-400 mb-3">
              <CheckCircle className="w-6 h-6 mr-2" />
              <span className="text-lg font-semibold">Document Verified!</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              {result.reason}
            </p>

            {result.documentInfo && (
              <div className="space-y-2 text-sm border-t border-green-200 dark:border-green-700 pt-3">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Document Hash:</span>
                  <p className="font-mono text-gray-600 dark:text-gray-400 break-all text-xs">
                    {result.documentInfo.documentHash}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Timestamp:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date(Number(result.documentInfo.timestamp) * 1000).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Signer:</span>
                  <p className="font-mono text-gray-600 dark:text-gray-400 break-all text-xs">
                    {result.documentInfo.signer}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Signature:</span>
                  <p className="font-mono text-gray-600 dark:text-gray-400 break-all text-xs">
                    {result.documentInfo.signature}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Not Verified */}
        {result?.isValid === false && (
          <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
            <div className="flex items-center text-red-600 dark:text-red-400 mb-2">
              <XCircle className="w-6 h-6 mr-2" />
              <span className="text-lg font-semibold">Document Not Verified</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {result.reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
