import axios from 'axios';

function getMockPublicKey(): string {
  return `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7uJcqzM1qVlCjYV8c9L2
GqD5N8s7R3K9X4Y6Z1A2B5C8E9F2G6H4I7J0K3L6M9N2O5P8Q1R4S7T0U3V6W9X2
Y5Z8A1B4C7D0E3F6G9H2I5J8K1L4M7N0O3P6Q9R2S5T8U1V4W7X0Y3Z6A9B2C5D8
E1F4G7H0I3J6K9L2M5N8O1P4Q7R0S3T6U9V2W5X8Y1Z4A7B0C3D6E9F2G5H8I1J4
K7L0M3N6O9P2Q5R8S1T4U7V0W3X6Y9Z2A5B8C1D4E7F0G3H6I9J2K5L8M1N4O7P0
Q3R6S9T2U5V8W1X4Y7Z0A3B6C9D2E5F8G1H4I7J0K3L6M9N2O5P8Q1R4S7T0U3V6
WQIDAQAB
-----END PUBLIC KEY-----`;
}

const pem = await (async (): Promise<string> => {
  if (import.meta.env.VITE_SKIP_LOGIN === 'true') {
    return getMockPublicKey();
  }

  try {
    const response = await axios.request({
      method: 'GET',
      url: '/v1/auth/public-key'
    });
    return response.data.publicKey as string;
  } catch (error) {
    console.error('Failed to fetch public key from server:', error);
    throw error;
  }
})();

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, '').replace(/\s/g, '');
  const binary = atob(b64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }
  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function encryptRSA(plaintext: string) {
  const keyBuffer = pemToArrayBuffer(pem);

  const publicKey = await crypto.subtle.importKey(
    'spki',
    keyBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    false,
    ['encrypt']
  );

  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, encoded);

  return arrayBufferToBase64(encrypted);
}
