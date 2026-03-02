'use client';

import { useState, useEffect } from 'react';
import { FileText, Clock, User, Copy, CheckCircle } from 'lucide-react';
import { useContract } from '@/hooks/useContract';

export default function DocumentHistory() {
  const { getDocumentCount, getDocumentHashByIndex, getDocumentInfo, isLoading } = useContract();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const fetchDocuments = async () => {
    setIsFetching(true);
    try {
      const count = await getDocumentCount();
      const docs = [];

      for (let i = 0; i < Number(count); i++) {
        const hash = await getDocumentHashByIndex(i);
        if (hash) {
          const info = await getDocumentInfo(hash);
          if (info) {
            docs.push({
              hash,
              ...info
            });
          }
        }
      }

      setDocuments(docs);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Document History
        </h2>
        <button
          onClick={fetchDocuments}
          disabled={isFetching}
          className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        >
          {isFetching ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {documents.length === 0 && !isFetching ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No documents stored yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FileText className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium text-gray-800 dark:text-white">
                      Document #{index + 1}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-600 dark:text-gray-400 mr-2">Hash:</span>
                      <code className="text-xs text-gray-500 dark:text-gray-400 break-all flex-1">
                        {doc.hash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(doc.hash)}
                        className="ml-2 text-gray-400 hover:text-blue-500"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>
                        {new Date(Number(doc.timestamp) * 1000).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4 mr-2" />
                      <code className="text-xs">{doc.signer}</code>
                      <button
                        onClick={() => copyToClipboard(doc.signer)}
                        className="ml-2 text-gray-400 hover:text-blue-500"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        Total documents: {documents.length}
      </div>
    </div>
  );
}
