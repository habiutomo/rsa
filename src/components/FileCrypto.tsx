import React, { useState, useCallback, useRef } from 'react';
import { FileText, Upload, Download, Lock, Unlock, Key, RefreshCw } from 'lucide-react';
import CryptoCard from './CryptoCard';
import Button from './Button';
import { generateAESKey, encryptFile, decryptFile, exportAESKey } from '../utils/fileCrypto';

const FileCrypto: React.FC = () => {
  const [aesKey, setAesKey] = useState<CryptoKey | null>(null);
  const [keyBase64, setKeyBase64] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [encryptedData, setEncryptedData] = useState<ArrayBuffer | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const encryptedFileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateKey = useCallback(async () => {
    setIsGenerating(true);
    try {
      const newKey = await generateAESKey();
      setAesKey(newKey);
      
      const keyData = await exportAESKey(newKey);
      setKeyBase64(keyData);
    } catch (error) {
      console.error('Key generation failed:', error);
      alert('Failed to generate encryption key.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleEncryptFile = useCallback(async () => {
    if (!aesKey || !selectedFile) return;
    
    setIsProcessing(true);
    setProcessProgress(0);
    
    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setProcessProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const encrypted = await encryptFile(aesKey, selectedFile);
      setEncryptedData(encrypted);
      
      clearInterval(progressInterval);
      setProcessProgress(100);
      
      setTimeout(() => setProcessProgress(0), 1000);
    } catch (error) {
      console.error('File encryption failed:', error);
      alert('File encryption failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [aesKey, selectedFile]);

  const handleDecryptFile = useCallback(async (encryptedFile: File) => {
    if (!aesKey) return;
    
    setIsProcessing(true);
    setProcessProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setProcessProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const decrypted = await decryptFile(aesKey, encryptedFile);
      
      // Create download link for decrypted file
      const blob = new Blob([decrypted.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = decrypted.filename;
      a.click();
      URL.revokeObjectURL(url);
      
      clearInterval(progressInterval);
      setProcessProgress(100);
      
      setTimeout(() => setProcessProgress(0), 1000);
    } catch (error) {
      console.error('File decryption failed:', error);
      alert('File decryption failed. Please check your file and key.');
    } finally {
      setIsProcessing(false);
    }
  }, [aesKey]);

  const handleEncryptedFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleDecryptFile(file);
    }
  }, [handleDecryptFile]);

  const downloadEncryptedFile = useCallback(() => {
    if (!encryptedData || !selectedFile) return;
    
    const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile.name}.encrypted`;
    a.click();
    URL.revokeObjectURL(url);
  }, [encryptedData, selectedFile]);

  const downloadKey = useCallback(() => {
    if (!keyBase64) return;
    
    const blob = new Blob([keyBase64], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'encryption_key.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [keyBase64]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return (
    <div className="space-y-6">
      {/* Key Management */}
      <CryptoCard title="Encryption Key" icon={Key}>
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
                Generate File Encryption Key
              </>
            )}
          </Button>
          
          {keyBase64 && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  🔑 Encryption Key Generated
                </label>
                <Button onClick={downloadKey} variant="secondary" className="text-xs py-1 px-2">
                  <Download className="h-3 w-3 mr-1" />
                  Save Key
                </Button>
              </div>
              <p className="text-xs text-red-300 mb-2">
                ⚠️ Save this key securely! You'll need it to decrypt your files.
              </p>
              <div className="bg-slate-800/50 p-2 rounded font-mono text-xs text-slate-400 break-all">
                {keyBase64.substring(0, 50)}...
              </div>
            </div>
          )}
        </div>
      </CryptoCard>

      {/* File Encryption */}
      <CryptoCard title="Encrypt File" icon={Lock}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select File to Encrypt
            </label>
            <div 
              className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div>
                  <FileText className="h-12 w-12 mx-auto mb-2 text-teal-400" />
                  <p className="text-slate-300 font-medium">{selectedFile.name}</p>
                  <p className="text-slate-500 text-sm">{formatFileSize(selectedFile.size)}</p>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 mx-auto mb-2 text-slate-500" />
                  <p className="text-slate-400">Click to select a file</p>
                  <p className="text-slate-600 text-sm">Any file type supported</p>
                </div>
              )}
            </div>
          </div>
          
          {isProcessing && processProgress > 0 && (
            <div>
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Processing...</span>
                <span>{processProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processProgress}%` }}
                ></div>
              </div>
            </div>
          )}
          
          <Button
            onClick={handleEncryptFile}
            disabled={!aesKey || !selectedFile || isProcessing}
            className="w-full"
            variant="success"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Encrypting File...
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Encrypt File
              </>
            )}
          </Button>
          
          {encryptedData && (
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 font-medium">✅ File encrypted successfully!</p>
                  <p className="text-slate-400 text-sm">
                    Size: {formatFileSize(encryptedData.byteLength)}
                  </p>
                </div>
                <Button onClick={downloadEncryptedFile} variant="success">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </div>
      </CryptoCard>

      {/* File Decryption */}
      <CryptoCard title="Decrypt File" icon={Unlock}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Encrypted File (.encrypted)
            </label>
            <div 
              className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors cursor-pointer"
              onClick={() => encryptedFileInputRef.current?.click()}
            >
              <input
                ref={encryptedFileInputRef}
                type="file"
                accept=".encrypted"
                onChange={handleEncryptedFileSelect}
                className="hidden"
              />
              <Unlock className="h-12 w-12 mx-auto mb-2 text-slate-500" />
              <p className="text-slate-400">Click to select encrypted file</p>
              <p className="text-slate-600 text-sm">Files with .encrypted extension</p>
            </div>
          </div>
          
          {!aesKey && (
            <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
              <p className="text-amber-300 text-sm">
                ⚠️ You need to generate or load an encryption key first to decrypt files.
              </p>
            </div>
          )}
        </div>
      </CryptoCard>

      {/* Security Information */}
      <CryptoCard title="File Encryption Security" icon={FileText}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-200 mb-2">Encryption Features</h4>
            <ul className="space-y-1 text-slate-400">
              <li>• AES-256-GCM encryption</li>
              <li>• File integrity verification</li>
              <li>• Original filename preservation</li>
              <li>• Binary data support</li>
            </ul>
          </div>
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-200 mb-2">Best Practices</h4>
            <ul className="space-y-1 text-slate-400">
              <li>• Store keys separately from files</li>
              <li>• Use unique keys for sensitive files</li>
              <li>• Keep backups of encryption keys</li>
              <li>• Verify file integrity after decryption</li>
            </ul>
          </div>
        </div>
      </CryptoCard>
    </div>
  );
};

export default FileCrypto;