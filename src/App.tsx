import React, { useState } from 'react';
import { Shield, Key, Lock, FileText, Download, Upload } from 'lucide-react';
import RSACrypto from './components/RSACrypto';
import AESCrypto from './components/AESCrypto';
import FileCrypto from './components/FileCrypto';
import Navigation from './components/Navigation';

function App() {
  const [activeTab, setActiveTab] = useState<'rsa' | 'aes' | 'file'>('rsa');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CryptoSecure</h1>
                <p className="text-slate-400 text-sm">RSA & AES Encryption Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-slate-300">
                <Lock className="h-4 w-4" />
                <span className="text-sm">Military-grade encryption</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {activeTab === 'rsa' && 'RSA Asymmetric Encryption'}
            {activeTab === 'aes' && 'AES Symmetric Encryption'}
            {activeTab === 'file' && 'File Encryption System'}
          </h2>
          <p className="text-slate-400">
            {activeTab === 'rsa' && 'Secure data transmission using public-key cryptography'}
            {activeTab === 'aes' && 'Fast and secure encryption for large data volumes'}
            {activeTab === 'file' && 'Encrypt and decrypt files with advanced security'}
          </p>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'rsa' && <RSACrypto />}
          {activeTab === 'aes' && <AESCrypto />}
          {activeTab === 'file' && <FileCrypto />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-slate-400 text-sm">
              Built with modern web cryptography standards • Secure • Fast • Reliable
            </p>
            <div className="flex justify-center items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2 text-slate-500 text-xs">
                <Key className="h-3 w-3" />
                <span>RSA-2048</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 text-xs">
                <Lock className="h-3 w-3" />
                <span>AES-256</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500 text-xs">
                <Shield className="h-3 w-3" />
                <span>Web Crypto API</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;