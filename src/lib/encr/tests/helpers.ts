import { Bytes, EncryptedRoomKey, encryptRoomKeyForUser } from "..";

// методы помощники для тестов

export function createEncryptedRoomKeys(
  roomKey: Bytes,
  participants: Array<{ userId: string; publicKey: Bytes }>
): EncryptedRoomKey[] {
  return participants.map(participant => 
    encryptRoomKeyForUser(roomKey, participant.publicKey, participant.userId)
  );
}

export function addParticipantToRoom(
  roomKey: Bytes,
  newParticipant: { userId: string; publicKey: Bytes },
  existingEncryptedKeys: EncryptedRoomKey[]
): EncryptedRoomKey[] {
  const newEncryptedKey = encryptRoomKeyForUser(roomKey, newParticipant.publicKey, newParticipant.userId);
  return [...existingEncryptedKeys, newEncryptedKey];
}

export function removeParticipantFromRoom(
  roomKey: Bytes,
  remainingParticipants: Array<{ userId: string; publicKey: Bytes }>
): EncryptedRoomKey[] {
  return createEncryptedRoomKeys(roomKey, remainingParticipants);
}