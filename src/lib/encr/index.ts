import * as x25519 from "@stablelib/x25519"
import { createCipheriv, createDecipheriv, createECDH, hkdfSync, randomBytes } from "crypto"

export type Bytes = Uint8Array
type KeyPair = {
    publicKey: Bytes
    privateKey: Bytes
}

export function generateUserKeyPair(): KeyPair {
    const kp = x25519.generateKeyPair()

    return {
        publicKey: kp.publicKey,
        privateKey: kp.secretKey
    }
}

export function generateRoomKey(): Bytes {
    return randomBytes(32);
}

export interface EncryptedRoomKey {
    userId: string;
    encryptedKey: Bytes;
    ephemeralPublicKey: Bytes;
    salt: Bytes;
    nonce: Bytes;
    timestamp: number;
}

export interface RoomKeyData {
    roomId: string;
    encryptedKeys: EncryptedRoomKey[];
    createdAt: number;
    updatedAt: number;
}

export function encryptRoomKeyForUser(
    roomKey: Bytes,
    recipientPublicKey: Bytes,
    userId: string
): EncryptedRoomKey {
    const ephemeralKeyPair = x25519.generateKeyPair();
    const sharedSecret = x25519.sharedKey(ephemeralKeyPair.secretKey, recipientPublicKey);

    const salt = randomBytes(32);
    const info = Buffer.from('room-key-incr', 'utf8');
    const derived = hkdfSync('sha256', sharedSecret, salt, info, 32);

    const nonce = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', Buffer.from(derived), nonce);
    const encrypted = Buffer.concat([
        cipher.update(roomKey),
        cipher.final(),
        cipher.getAuthTag()
    ]);

    return {
        userId,
        encryptedKey: encrypted,
        ephemeralPublicKey: ephemeralKeyPair.publicKey,
        salt,
        nonce,
        timestamp: Date.now()
    };
}

export function decryptRoomKeyForUser(
    encryptedRoomKey: EncryptedRoomKey,
    userPrivateKey: Bytes
): Bytes {
    const { encryptedKey, ephemeralPublicKey, salt, nonce } = encryptedRoomKey;

    if (encryptedKey.length < 16) {
        throw new Error('Invalid encrypted data');
    }

    const ciphertextWithTag = encryptedKey;
    const ciphertext = ciphertextWithTag.subarray(0, -16);
    const authTag = ciphertextWithTag.subarray(-16);

    const sharedSecret = x25519.sharedKey(userPrivateKey, ephemeralPublicKey);
    const info = Buffer.from('room-key-incr', 'utf8');
    const derivedKey = hkdfSync('sha256', sharedSecret, salt, info, 32);

    const decipher = createDecipheriv('aes-256-gcm', Buffer.from(derivedKey), nonce);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
    ]);
}

export function encryptRoomKeyToBase64JSON(data: EncryptedRoomKey): string {
    const obj = {
        userId: data.userId,
        encryptedKey: uint8ToBase64(data.encryptedKey),
        ephemeralPublicKey: uint8ToBase64(data.ephemeralPublicKey),
        salt: uint8ToBase64(data.salt),
        nonce: uint8ToBase64(data.nonce),
        timestamp: data.timestamp
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
        timestamp: obj.timestamp
    };
}

function uint8ToBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
}

function base64ToUint8(base64: string): Uint8Array {
    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
}
