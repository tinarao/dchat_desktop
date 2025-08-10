import { describe, expect, expectTypeOf, test } from "vitest";
import { base64ToEncryptRoomKeyJSON, Bytes, decryptMessage, decryptRoomKeyForUser, EncryptedRoomKey, encryptMessage, encryptRoomKeyForUser, encryptRoomKeyToBase64JSON, generateRoomKey, generateUserKeyPair, KeyPair } from "..";
import { DecimalsArrowLeftIcon } from "lucide-react";

type MockUser = {
    id: number
    keyPair: KeyPair
    encrRoomKey?: EncryptedRoomKey
}

function createMockUser(id: number, rawRoomKey: Bytes): MockUser {
    const keyPair = generateUserKeyPair()
    return {
        id,
        keyPair,
        encrRoomKey: encryptRoomKeyForUser(rawRoomKey, keyPair.publicKey, id.toString())
    }
}

describe("messages encryption", () => {
    test("encryptMessage should work", () => {
        // lol pretty much all-included test again bruh
        const rawRoomKey = generateRoomKey()

        const firstUser = createMockUser(1, rawRoomKey)
        const otherUser = createMockUser(2, rawRoomKey)

        const firstEncrRoomKey = encryptRoomKeyForUser(rawRoomKey, firstUser.keyPair.publicKey, firstUser.id.toString())
        const otherEncrRoomKey = encryptRoomKeyForUser(rawRoomKey, otherUser.keyPair.publicKey, otherUser.id.toString())

        const firstDecoded =
            decryptRoomKeyForUser(
                base64ToEncryptRoomKeyJSON(encryptRoomKeyToBase64JSON(firstEncrRoomKey)),
                firstUser.keyPair.privateKey
            )

        const otherDecoded =
            decryptRoomKeyForUser(
                base64ToEncryptRoomKeyJSON(encryptRoomKeyToBase64JSON(otherEncrRoomKey)),
                otherUser.keyPair.privateKey
            )

        const plainMsg = "aboba jopa!!! pidor"

        const encrMessage = encryptMessage(plainMsg, firstDecoded)
        const decryptedByFirst = decryptMessage(encrMessage, firstDecoded)
        const decryptedByOther = decryptMessage(encrMessage, otherDecoded)

        expect(() => {
            decryptMessage(encrMessage, new Uint8Array)
        }).toThrow()

        expectTypeOf(decryptedByFirst).toBeString()
        expectTypeOf(decryptedByOther).toBeString()
        expect(decryptedByFirst).toBe(plainMsg)
        expect(decryptedByOther).toBe(plainMsg)
        expect(decryptedByFirst).toBe(decryptedByOther)
    })
})
