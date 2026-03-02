'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onHashGenerated: (hash: string, timestamp: number) => void;
}

export default function FileUploader({ onHashGenerated }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (selectedFile: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Calculate keccak256 hash
      const hash = ethers.keccak256(uint8Array);
      const timestamp = Math.floor(Date.now() / 1000);

      setHash(hash);
      setTimestamp(timestamp);
      setFile(selectedFile);
      onHashGenerated(hash, timestamp);
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
      setHash(null);
      setTimestamp(0);
    } finally {
      setIsProcessing(false);
    }
  }, [onHashGenerated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  }, [processFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Upload Document
      </h2>

      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Any file type accepted
          </p>
        </label>
      </div>

      {isProcessing && (
        <div className="mt-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Processing...</span>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {file && hash && !isProcessing && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center mb-2">
            <FileText className="w-5 h-5 mr-2 text-blue-500" />
            <span className="font-medium text-gray-800 dark:text-white">
              {file.name}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Size: {(file.size / 1024).toFixed(2)} KB
          </p>
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Document Hash (keccak256):
            </p>
            <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
              {hash}
            </p>
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Timestamp:
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(timestamp * 1000).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
