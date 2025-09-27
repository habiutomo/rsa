// RSA Cryptography utilities using Web Crypto API

export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptRSA(publicKey: CryptoKey, plaintext: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    data
  );
  
  return arrayBufferToBase64(encrypted);
}

export async function decryptRSA(privateKey: CryptoKey, encryptedData: string): Promise<string> {
  const encrypted = base64ToArrayBuffer(encryptedData);
  
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    encrypted
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export async function exportKey(key: CryptoKey, type: 'public' | 'private'): Promise<string> {
  const exported = await window.crypto.subtle.exportKey(
    type === 'public' ? 'spki' : 'pkcs8',
    key
  );
  
  const exportedAsBase64 = arrayBufferToBase64(exported);
  const pemHeader = type === 'public' 
    ? '-----BEGIN PUBLIC KEY-----' 
    : '-----BEGIN PRIVATE KEY-----';
  const pemFooter = type === 'public' 
    ? '-----END PUBLIC KEY-----' 
    : '-----END PRIVATE KEY-----';
  
  const pemContents = exportedAsBase64.match(/.{1,64}/g)?.join('\n') || '';
  return `${pemHeader}\n${pemContents}\n${pemFooter}`;
}

export async function importKey(pemString: string, type: 'public' | 'private'): Promise<CryptoKey> {
  const pemHeader = type === 'public' 
    ? '-----BEGIN PUBLIC KEY-----' 
    : '-----BEGIN PRIVATE KEY-----';
  const pemFooter = type === 'public' 
    ? '-----END PUBLIC KEY-----' 
    : '-----END PRIVATE KEY-----';
  
  const pemContents = pemString
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\s/g, '');
  
  const binaryString = window.atob(pemContents);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return await window.crypto.subtle.importKey(
    type === 'public' ? 'spki' : 'pkcs8',
    bytes.buffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    type === 'public' ? ['encrypt'] : ['decrypt']
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