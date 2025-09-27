import React, { useState, useCallback } from 'react';
import { Lock, Unlock, Key, Copy, RefreshCw } from 'lucide-react';
import CryptoCard from './CryptoCard';
import Button from './Button';
import TextArea from './TextArea';
import { generateAESKey, encryptAES, decryptAES, exportAESKey, importAESKey } from '../utils/aesCrypto';

const AESCrypto: React.FC = () => {
  const [aesKey, setAesKey] = useState<CryptoKey | null>(null);
  const [keyBase64, setKeyBase64] = useState('');
  const [plainText, setPlainText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleGenerateKey = useCallback(async () => {
    setIsGenerating(true);
    try {
      const newKey = await generateAESKey();
      setAesKey(newKey);
      
      const keyData = await exportAESKey(newKey);
      setKeyBase64(keyData);
    } catch (error) {
      console.error('Key generation failed:', error);
      alert('Failed to generate AES key. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleEncrypt = useCallback(async () => {
    if (!aesKey || !plainText) return;
    
    setIsEncrypting(true);
    try {
      const encrypted = await encryptAES(aesKey, plainText);
      setEncryptedText(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      alert('Encryption failed. Please check your input.');
    } finally {
      setIsEncrypting(false);
    }
  }, [aesKey, plainText]);

  const handleDecrypt = useCallback(async () => {
    if (!aesKey || !encryptedText) return;
    
    setIsDecrypting(true);
    try {
      const decrypted = await decryptAES(aesKey, encryptedText);
      setDecryptedText(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      alert('Decryption failed. Please check your encrypted text.');
    } finally {
      setIsDecrypting(false);
    }
  }, [aesKey, encryptedText]);

  const handleImportKey = useCallback(async (keyData: string) => {
    try {
      const importedKey = await importAESKey(keyData);
      setAesKey(importedKey);
      setKeyBase64(keyData);
    } catch (error) {
      console.error('Key import failed:', error);
      alert('Failed to import key. Please check the key format.');
    }
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  return (
    <div className="space-y-6">
      {/* Key Generation */}
      <CryptoCard title="AES Key Management" icon={Key}>
        <div className="space-y-4">
          <Button
            onClick={handleGenerateKey}
            disabled={isGenerating}
            className="w-full"
            variant="primary"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Generating Key...
              </>
            ) : (
              <>
                <Key className="h-5 w-5 mr-2" />
                Generate AES-256 Key
              </>
            )}
          </Button>
          
          {keyBase64 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                AES Key (Base64) - Keep this secret!
              </label>
              <div className="relative">
                <textarea
                  value={keyBase64}
                  readOnly
                  className="w-full p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-slate-200 text-sm font-mono resize-none"
                  rows={3}
                />
                <button
                  onClick={() => copyToClipboard(keyBase64)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600/50 hover:bg-red-500/50 rounded text-slate-300 hover:text-white transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Import Existing Key (Base64)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Paste your AES key here..."
                className="flex-1 p-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    handleImportKey(e.currentTarget.value);
                  }
                }}
              />
              <Button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Paste your AES key here..."]') as HTMLInputElement;
                  if (input?.value) {
                    handleImportKey(input.value);
                  }
                }}
                variant="secondary"
              >
                Import
              </Button>
            </div>
          </div>
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
            rows={5}
          />
          
          <Button
            onClick={handleEncrypt}
            disabled={!aesKey || !plainText || isEncrypting}
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
                Encrypt with AES-256
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
                  rows={5}
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
            rows={5}
          />
          
          <Button
            onClick={handleDecrypt}
            disabled={!aesKey || !encryptedText || isDecrypting}
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
                Decrypt with AES-256
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
                  rows={5}
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

      {/* Security Information */}
      <CryptoCard title="AES Security Information" icon={Lock}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-200 mb-2">Algorithm Details</h4>
            <ul className="space-y-1 text-slate-400">
              <li>• AES-256-GCM encryption</li>
              <li>• 256-bit key length</li>
              <li>• Authenticated encryption</li>
              <li>• Random IV generation</li>
            </ul>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-200 mb-2">Security Features</h4>
            <ul className="space-y-1 text-slate-400">
              <li>• Military-grade encryption</li>
              <li>• Integrity verification</li>
              <li>• Forward secrecy</li>
              <li>• NIST approved</li>
            </ul>
          </div>
        </div>
      </CryptoCard>
    </div>
  );
};

export default AESCrypto;