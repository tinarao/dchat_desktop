import { describe, expect, expectTypeOf, test } from "vitest";
import {
  base64ToEncryptRoomKeyJSON,
  base64ToUint8,
  Bytes,
  decryptMessage,
  decryptRoomKeyForUser,
  EncryptedRoomKey,
  encryptMessage,
  encryptRoomKeyForUser,
  encryptRoomKeyToBase64JSON,
  generateRoomKey,
  generateUserKeyPair,
  KeyPair,
  uint8ToBase64,
} from "..";

type MockUser = {
  id: number;
  keyPair: KeyPair;
  encrRoomKey?: EncryptedRoomKey;
};

async function createMockUser(
  id: number,
  rawRoomKey: Bytes
): Promise<MockUser> {
  const keyPair = generateUserKeyPair();
  return {
    id,
    keyPair,
    encrRoomKey: encryptRoomKeyForUser(
      rawRoomKey,
      keyPair.publicKey,
      id.toString()
    ),
  };
}

// я гений в области необычных криптографических названий переменных
describe("messages encryption", () => {
  test("encryptMessage should work", async () => {
    // lol pretty much all-included test again bruh
    const rawRoomKey = generateRoomKey();

    const firstUser = await createMockUser(1, rawRoomKey);
    const otherUser = await createMockUser(2, rawRoomKey);

    const firstEncrRoomKey = await encryptRoomKeyForUser(
      rawRoomKey,
      firstUser.keyPair.publicKey,
      firstUser.id.toString()
    );
    const otherEncrRoomKey = await encryptRoomKeyForUser(
      rawRoomKey,
      otherUser.keyPair.publicKey,
      otherUser.id.toString()
    );

    const firstDecoded = await decryptRoomKeyForUser(
      base64ToEncryptRoomKeyJSON(encryptRoomKeyToBase64JSON(firstEncrRoomKey)),
      firstUser.keyPair.privateKey
    );

    const otherDecoded = await decryptRoomKeyForUser(
      base64ToEncryptRoomKeyJSON(encryptRoomKeyToBase64JSON(otherEncrRoomKey)),
      otherUser.keyPair.privateKey
    );

    const plainMsg = "aboba jopa!!! pidor";

    const encrMessage = await encryptMessage(plainMsg, firstDecoded);

    // прогоняем через базу
    const base64EncrMessage = uint8ToBase64(encrMessage);
    const decodedBase64Message = base64ToUint8(base64EncrMessage);

    const decryptedByFirst = await decryptMessage(
      decodedBase64Message,
      firstDecoded
    );
    const decryptedByOther = await decryptMessage(
      decodedBase64Message,
      otherDecoded
    );

    expect(() => {
      decryptMessage(encrMessage, new Uint8Array());
    }).toThrow();

    expectTypeOf(decryptedByFirst).toBeString();
    expectTypeOf(decryptedByOther).toBeString();
    expect(decryptedByFirst).toBe(plainMsg);
    expect(decryptedByOther).toBe(plainMsg);
    expect(decryptedByFirst).toBe(decryptedByOther);
  });
});
