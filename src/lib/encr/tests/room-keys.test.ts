import { describe, expect, expectTypeOf, test } from "vitest"
import {
    Bytes,
    generateRoomKey,
    generateUserKeyPair,
    decryptRoomKeyForUser,
    encryptRoomKeyForUser,
    EncryptedRoomKey,
    encryptRoomKeyToBase64JSON,
    base64ToEncryptRoomKeyJSON,
} from ".."
import { addParticipantToRoom, createEncryptedRoomKeys, removeParticipantFromRoom } from "./helpers"

describe("room keys", () => {
    test("generateKeyPair generates a keypair", () => {
        const keys = generateUserKeyPair()
        expect(keys).toHaveProperty("publicKey");
        expect(keys).toHaveProperty("privateKey");
        expectTypeOf(keys.publicKey).toEqualTypeOf<Bytes>();
        expectTypeOf(keys.privateKey).toEqualTypeOf<Bytes>();
    })

    test("generateRoomKey returns Uint8Array(32)", () => {
        const roomKey = generateRoomKey()
        expectTypeOf(roomKey).toEqualTypeOf<Uint8Array>();
        expect(roomKey.length).toBe(32);
    })

    test("encrypted roomKey should be decrypted with their public key and be equal to itself", () => {
        const theirKeyPair = generateUserKeyPair()
        const theirId = 1

        const roomKey = generateRoomKey()
        const encryptedRoomKey = encryptRoomKeyForUser(roomKey, theirKeyPair.publicKey, theirId.toString())
        expectTypeOf(encryptedRoomKey).toEqualTypeOf<EncryptedRoomKey>();

        const decryptedRoomKey = decryptRoomKeyForUser(encryptedRoomKey, theirKeyPair.privateKey)
        expect(decryptedRoomKey).toEqual(roomKey)
    })

    test("group encryption should work for multiple participants", () => {
        const roomKey = generateRoomKey()

        const user1KeyPair = generateUserKeyPair()
        const user2KeyPair = generateUserKeyPair()
        const user3KeyPair = generateUserKeyPair()

        const participants = [
            { userId: "user1", publicKey: user1KeyPair.publicKey },
            { userId: "user2", publicKey: user2KeyPair.publicKey },
            { userId: "user3", publicKey: user3KeyPair.publicKey }
        ]

        const encryptedKeys = createEncryptedRoomKeys(roomKey, participants)
        expect(encryptedKeys).toHaveLength(3)

        const decryptedKey1 = decryptRoomKeyForUser(encryptedKeys[0], user1KeyPair.privateKey)
        expect(decryptedKey1).toEqual(roomKey)

        const decryptedKey2 = decryptRoomKeyForUser(encryptedKeys[1], user2KeyPair.privateKey)
        expect(decryptedKey2).toEqual(roomKey)

        const decryptedKey3 = decryptRoomKeyForUser(encryptedKeys[2], user3KeyPair.privateKey)
        expect(decryptedKey3).toEqual(roomKey)
    })

    test("should not decrypt with unknown key", () => {
        const myUserId = 1;
        const myKeyPair = generateUserKeyPair()
        const badGuyKeyPair = generateUserKeyPair()

        const roomKey = generateRoomKey()
        const myEncrRoomKey = encryptRoomKeyForUser(roomKey, myKeyPair.publicKey, myUserId.toString())

        expect(() => {
            decryptRoomKeyForUser(myEncrRoomKey, badGuyKeyPair.privateKey)
        }).toThrow()


        expect(() => {
            decryptRoomKeyForUser(myEncrRoomKey, new Uint8Array)
        }).toThrow()


        for (const i in Array.from({ length: 500 }, (_, i) => i)) {
            expect(() => {
                decryptRoomKeyForUser(myEncrRoomKey, generateUserKeyPair().privateKey)
            }).toThrow()
        }

        expect(() => {
            decryptRoomKeyForUser(myEncrRoomKey, myKeyPair.privateKey)
        }).not.toThrow()
    })

    test("adding participant should create new encrypted key", () => {
        const roomKey = generateRoomKey()
        const initialParticipants = [
            { userId: "user1", publicKey: generateUserKeyPair().publicKey },
            { userId: "user2", publicKey: generateUserKeyPair().publicKey }
        ]

        const initialEncryptedKeys = createEncryptedRoomKeys(roomKey, initialParticipants)
        const newParticipant = { userId: "user3", publicKey: generateUserKeyPair().publicKey }

        const updatedEncryptedKeys = addParticipantToRoom(roomKey, newParticipant, initialEncryptedKeys)

        expect(updatedEncryptedKeys).toHaveLength(3)
        expect(updatedEncryptedKeys[2].userId).toBe("user3")
    })

    test("removing participant should recreate keys for remaining users", () => {
        const roomKey = generateRoomKey()
        const allParticipants = [
            { userId: "user1", publicKey: generateUserKeyPair().publicKey },
            { userId: "user2", publicKey: generateUserKeyPair().publicKey },
            { userId: "user3", publicKey: generateUserKeyPair().publicKey }
        ]

        createEncryptedRoomKeys(roomKey, allParticipants)
        const remainingParticipants = allParticipants.filter(p => p.userId !== "user2")

        const updatedEncryptedKeys = removeParticipantFromRoom(roomKey, remainingParticipants)

        expect(updatedEncryptedKeys).toHaveLength(2)
        expect(updatedEncryptedKeys.every(key => key.userId !== "user2")).toBe(true)
    })

    test("encryptedRoomKeyToBase64 should serialize key to base64 and deserialize it back", () => {
        const roomKey = generateRoomKey()
        const keys = generateUserKeyPair()
        const userId = 1

        const encryptedRoomKey = encryptRoomKeyForUser(roomKey, keys.publicKey, userId.toString())
        const base64 = encryptRoomKeyToBase64JSON(encryptedRoomKey)
        expectTypeOf(base64).toBeString()

        const roomKeyFromBase64 = base64ToEncryptRoomKeyJSON(base64)

        const decr = decryptRoomKeyForUser(roomKeyFromBase64, keys.privateKey)
        expect(decr).toStrictEqual(roomKey)
    })
})
