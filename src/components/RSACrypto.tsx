import React, { useState, useCallback } from 'react';
import { Key, Copy, Download, Upload, RefreshCw, Lock, Unlock } from 'lucide-react';
import CryptoCard from './CryptoCard';
import Button from './Button';
import TextArea from './TextArea';
import { generateRSAKeyPair, encryptRSA, decryptRSA, exportKey, importKey } from '../utils/rsaCrypto';

const RSACrypto: React.FC = () => {
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const [publicKeyPem, setPublicKeyPem] = useState('');
  const [privateKeyPem, setPrivateKeyPem] = useState('');
  const [plainText, setPlainText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleGenerateKeys = useCallback(async () => {
    setIsGenerating(true);
    try {
      const newKeyPair = await generateRSAKeyPair();
      setKeyPair(newKeyPair);
      
      const publicPem = await exportKey(newKeyPair.publicKey, 'public');
      const privatePem = await exportKey(newKeyPair.privateKey, 'private');
      
      setPublicKeyPem(publicPem);
      setPrivateKeyPem(privatePem);
    } catch (error) {
      console.error('Key generation failed:', error);
      alert('Failed to generate keys. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleEncrypt = useCallback(async () => {
    if (!keyPair || !plainText) return;
    
    setIsEncrypting(true);
    try {
      const encrypted = await encryptRSA(keyPair.publicKey, plainText);
      setEncryptedText(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      alert('Encryption failed. Please check your input.');
    } finally {
      setIsEncrypting(false);
    }
  }, [keyPair, plainText]);

  const handleDecrypt = useCallback(async () => {
    if (!keyPair || !encryptedText) return;
    
    setIsDecrypting(true);
    try {
      const decrypted = await decryptRSA(keyPair.privateKey, encryptedText);
      setDecryptedText(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      alert('Decryption failed. Please check your encrypted text.');
    } finally {
      setIsDecrypting(false);
    }
  }, [keyPair, encryptedText]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  }, []);

  const downloadKey = useCallback((key: string, filename: string) => {
    const blob = new Blob([key], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="space-y-6">
      {/* Key Generation */}
      <CryptoCard title="RSA Key Generation" icon={Key}>
        <div className="space-y-4">
          <Button
            onClick={handleGenerateKeys}
            disabled={isGenerating}
            className="w-full"
            variant="primary"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Generating Keys...
              </>
            ) : (
              <>
                <Key className="h-5 w-5 mr-2" />
                Generate RSA Key Pair (2048-bit)
              </>
            )}
          </Button>
          
          {publicKeyPem && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Public Key (Share this safely)
                </label>
                <div className="relative">
                  <textarea
                    value={publicKeyPem}
                    readOnly
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 text-sm font-mono resize-none"
                    rows={6}
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(publicKeyPem)}
                      className="p-1.5 bg-slate-600/50 hover:bg-slate-500/50 rounded text-slate-300 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => downloadKey(publicKeyPem, 'public_key.pem')}
                      className="p-1.5 bg-slate-600/50 hover:bg-slate-500/50 rounded text-slate-300 hover:text-white transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Private Key (Keep this secret!)
                </label>
                <div className="relative">
                  <textarea
                    value={privateKeyPem}
                    readOnly
                    className="w-full p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-slate-200 text-sm font-mono resize-none"
                    rows={6}
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(privateKeyPem)}
                      className="p-1.5 bg-red-600/50 hover:bg-red-500/50 rounded text-slate-300 hover:text-white transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => downloadKey(privateKeyPem, 'private_key.pem')}
                      className="p-1.5 bg-red-600/50 hover:bg-red-500/50 rounded text-slate-300 hover:text-white transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CryptoCard>

      {/* Encryption */}
      <CryptoCard title="Encrypt Data" icon={Lock}>
        <div className="space-y-4">
          <TextArea
            label="Plain Text"
            placeholder="Enter text to encrypt..."
            value={plainText}
            onChange={setPlainText}
            rows={4}
          />
          
          <Button
            onClick={handleEncrypt}
            disabled={!keyPair || !plainText || isEncrypting}
            className="w-full"
            variant="success"
          >
            {isEncrypting ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Encrypting...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Encrypt with Public Key
              </>
            )}
          </Button>
          
          {encryptedText && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Encrypted Data (Base64)
              </label>
              <div className="relative">
                <textarea
                  value={encryptedText}
                  readOnly
                  className="w-full p-3 bg-green-900/20 border border-green-700/50 rounded-lg text-slate-200 text-sm font-mono resize-none"
                  rows={4}
                />
                <button
                  onClick={() => copyToClipboard(encryptedText)}
                  className="absolute top-2 right-2 p-1.5 bg-green-600/50 hover:bg-green-500/50 rounded text-slate-300 hover:text-white transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </CryptoCard>

      {/* Decryption */}
      <CryptoCard title="Decrypt Data" icon={Unlock}>
        <div className="space-y-4">
          <TextArea
            label="Encrypted Text (Base64)"
            placeholder="Paste encrypted text here..."
            value={encryptedText}
            onChange={setEncryptedText}
            rows={4}
          />
          
          <Button
            onClick={handleDecrypt}
            disabled={!keyPair || !encryptedText || isDecrypting}
            className="w-full"
            variant="warning"
          >
            {isDecrypting ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Decrypting...
              </>
            ) : (
              <>
                <Unlock className="h-5 w-5 mr-2" />
                Decrypt with Private Key
              </>
            )}
          </Button>
          
          {decryptedText && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Decrypted Data
              </label>
              <div className="relative">
                <textarea
                  value={decryptedText}
                  readOnly
                  className="w-full p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg text-slate-200 text-sm resize-none"
                  rows={4}
                />
                <button
                  onClick={() => copyToClipboard(decryptedText)}
                  className="absolute top-2 right-2 p-1.5 bg-blue-600/50 hover:bg-blue-500/50 rounded text-slate-300 hover:text-white transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </CryptoCard>
    </div>
  );
};

export default RSACrypto;