// File Cryptography utilities using Web Crypto API

export async function generateAESKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptFile(key: CryptoKey, file: File): Promise<ArrayBuffer> {
  const fileData = await file.arrayBuffer();
  const filename = file.name;
  const filenameBytes = new TextEncoder().encode(filename);
  
  // Create header with filename length and filename
  const filenameLength = new Uint32Array([filenameBytes.length]);
  const header = new Uint8Array(4 + filenameBytes.length);
  header.set(new Uint8Array(filenameLength.buffer));
  header.set(filenameBytes, 4);
  
  // Combine header and file data
  const combined = new Uint8Array(header.length + fileData.byteLength);
  combined.set(header);
  combined.set(new Uint8Array(fileData), header.length);
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    combined
  );
  
  // Combine IV and encrypted data
  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);
  
  return result.buffer;
}

export async function decryptFile(key: CryptoKey, encryptedFile: File): Promise<{data: ArrayBuffer, filename: string}> {
  const encryptedData = await encryptedFile.arrayBuffer();
  
  // Extract IV and encrypted data
  const iv = encryptedData.slice(0, 12);
  const encrypted = encryptedData.slice(12);
  
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encrypted
  );
  
  // Extract filename from decrypted data
  const filenameLength = new Uint32Array(decrypted.slice(0, 4))[0];
  const filename = new TextDecoder().decode(decrypted.slice(4, 4 + filenameLength));
  const fileData = decrypted.slice(4 + filenameLength);
  
  return {
    data: fileData,
    filename: filename
  };
}

export async function exportAESKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

export async function importAESKey(keyData: string): Promise<CryptoKey> {
  const keyBuffer = base64ToArrayBuffer(keyData);
  
  return await window.crypto.subtle.importKey(
    'raw',
    keyBuffer,
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}