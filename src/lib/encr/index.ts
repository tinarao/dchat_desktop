import * as x25519 from "@stablelib/x25519";

export type Bytes = Uint8Array;

export type KeyPair = {
  publicKey: Bytes;
  privateKey: Bytes;
};

export type EncryptedRoomKey = {
  userId: string;
  encryptedKey: Bytes;
  ephemeralPublicKey: Bytes;
  salt: Bytes;
  nonce: Bytes;
  timestamp: number;
};

export type RoomKeyData = {
  roomId: string;
  encryptedKeys: EncryptedRoomKey[];
  createdAt: number;
  updatedAt: number;
};

export function generateUserKeyPair(): KeyPair {
  const kp = x25519.generateKeyPair();

  return {
    publicKey: kp.publicKey,
    privateKey: kp.secretKey,
  };
}

// room keys

export function generateRoomKey(): Bytes {
  return crypto.getRandomValues(new Uint8Array(32));
}

async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    ikm,
    { name: "HKDF" },
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: salt,
      info: info,
    },
    baseKey,
    length * 8
  );

  return new Uint8Array(bits);
}

async function importAesKey(keyData: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptRoomKeyForUser(
  roomKey: Bytes,
  recipientPublicKey: Bytes,
  userId: string
): Promise<EncryptedRoomKey> {
  const ephemeralKeyPair = x25519.generateKeyPair();
  const sharedSecret = x25519.sharedKey(
    ephemeralKeyPair.secretKey,
    recipientPublicKey
  );

  const salt = crypto.getRandomValues(new Uint8Array(32));
  const info = new TextEncoder().encode("room-key-incr");
  const derived = await hkdf(salt, sharedSecret, info, 32);

  const key = await importAesKey(derived);
  const nonce = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    roomKey
  );

  return {
    userId,
    encryptedKey: new Uint8Array(encrypted),
    ephemeralPublicKey: ephemeralKeyPair.publicKey,
    salt,
    nonce,
    timestamp: Date.now(),
  };
}

export async function decryptRoomKeyForUser(
  encryptedRoomKey: EncryptedRoomKey,
  userPrivateKey: Bytes
): Promise<Bytes> {
  const { encryptedKey, ephemeralPublicKey, salt, nonce } = encryptedRoomKey;

  const sharedSecret = x25519.sharedKey(userPrivateKey, ephemeralPublicKey);
  const info = new TextEncoder().encode("room-key-incr");
  const derived = await hkdf(salt, sharedSecret, info, 32);

  const key = await importAesKey(derived);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    encryptedKey
  );

  return new Uint8Array(decrypted);
}

export async function encryptMessage(
  plainMessage: string,
  roomKey: Bytes
): Promise<Bytes> {
  const key = await importAesKey(roomKey);
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plainMessage);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    encoded
  );

  const result = new Uint8Array(nonce.length + encrypted.byteLength);
  result.set(nonce);
  result.set(new Uint8Array(encrypted), nonce.length);
  return result;
}

export async function decryptMessage(
  encrypted: Bytes,
  roomKey: Bytes
): Promise<string> {
  if (encrypted.length < 12 + 16) {
    throw new Error("Invalid data");
  }

  const nonce = encrypted.subarray(0, 12);
  const ciphertext = encrypted.subarray(12);
  const key = await importAesKey(roomKey);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: nonce },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

// helpers

export function encryptRoomKeyToBase64JSON(data: EncryptedRoomKey): string {
  const obj = {
    userId: data.userId,
    encryptedKey: uint8ToBase64(data.encryptedKey),
    ephemeralPublicKey: uint8ToBase64(data.ephemeralPublicKey),
    salt: uint8ToBase64(data.salt),
    nonce: uint8ToBase64(data.nonce),
    timestamp: data.timestamp,
  };
  return btoa(JSON.stringify(obj));
}

export function base64ToEncryptRoomKeyJSON(base64: string): EncryptedRoomKey {
  const obj = JSON.parse(atob(base64));
  return {
    userId: obj.userId,
    encryptedKey: base64ToUint8(obj.encryptedKey),
    ephemeralPublicKey: base64ToUint8(obj.ephemeralPublicKey),
    salt: base64ToUint8(obj.salt),
    nonce: base64ToUint8(obj.nonce),
    timestamp: obj.timestamp,
  };
}

export function uint8ToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export function base64ToUint8(base64: string): Uint8Array {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}
