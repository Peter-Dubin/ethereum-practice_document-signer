'use client';

import { useState } from 'react';
import { Wallet, FileUp, PenTool, Search, History, ChevronDown, ChevronUp } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import FileUploader from '@/components/FileUploader';
import DocumentSigner from '@/components/DocumentSigner';
import DocumentVerifier from '@/components/DocumentVerifier';
import DocumentHistory from '@/components/DocumentHistory';

type Tab = 'sign' | 'verify' | 'history';

export default function Home() {
  const { wallets, currentWallet, currentIndex, setCurrentIndex, isLoading } = useWallet();
  const [activeTab, setActiveTab] = useState<Tab>('sign');
  const [documentHash, setDocumentHash] = useState<string>('');
  const [timestamp, setTimestamp] = useState<number>(0);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  const handleHashGenerated = (hash: string, ts: number) => {
    setDocumentHash(hash);
    setTimestamp(ts);
  };

  const tabs = [
    { id: 'sign' as Tab, label: 'Sign Document', icon: PenTool },
    { id: 'verify' as Tab, label: 'Verify Document', icon: Search },
    { id: 'history' as Tab, label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileUp className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Document Signer
              </h1>
            </div>

            {/* Wallet Selector */}
            <div className="relative">
              <button
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                disabled={isLoading}
                className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Wallet className="w-5 h-5 mr-2" />
                <span className="font-mono text-sm">
                  {currentWallet
                    ? `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}`
                    : 'Loading...'}
                </span>
                {showWalletDropdown ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </button>

              {showWalletDropdown && wallets.length > 0 && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                      Select Wallet (Anvil)
                    </p>
                    {wallets.map((wallet, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentIndex(index);
                          setShowWalletDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono hover:bg-gray-100 dark:hover:bg-gray-600 ${
                          index === currentIndex
                            ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-gray-500 dark:text-gray-400 mr-2">
                          #{index}
                        </span>
                        {wallet.address}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {activeTab === 'sign' && (
            <>
              <FileUploader onHashGenerated={handleHashGenerated} />
              <DocumentSigner documentHash={documentHash} timestamp={timestamp} />
            </>
          )}

          {activeTab === 'verify' && (
            <div className="lg:col-span-2">
              <DocumentVerifier />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="lg:col-span-2">
              <DocumentHistory />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Document Signer dApp - Powered by Ethereum & Foundry</p>
          <p className="mt-1">Network: Local (Anvil) | Chain ID: 31337</p>
        </div>
      </footer>
    </div>
  );
}
