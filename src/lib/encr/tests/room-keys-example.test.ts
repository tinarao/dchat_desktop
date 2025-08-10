import { describe, expect, test, beforeEach } from "vitest"
import {
    generateUserKeyPair,
    generateRoomKey,
    decryptRoomKeyForUser,
    type RoomKeyData
} from '../index'
import { addParticipantToRoom, createEncryptedRoomKeys, removeParticipantFromRoom } from "./helpers";

let rooms: Map<string, RoomKeyData>
let users: Map<string, { publicKey: Uint8Array; privateKey: Uint8Array }>

// Тестируется как всё это дело работает при n > 2 наборе участников в приближённых к реальным кейсах

function createUser(userId: string) {
    const keyPair = generateUserKeyPair()
    users.set(userId, keyPair)
    return keyPair
}

function createRoom(roomId: string, participantIds: string[]) {
    const roomKey = generateRoomKey()

    const participants = participantIds.map(userId => {
        const user = users.get(userId)
        if (!user) throw new Error(`User ${userId} not found`)
        return { userId, publicKey: user.publicKey }
    })

    const encryptedKeys = createEncryptedRoomKeys(roomKey, participants)

    // save to db 
    const roomData: RoomKeyData = {
        roomId,
        encryptedKeys,
        createdAt: Date.now(),
        updatedAt: Date.now()
    }

    rooms.set(roomId, roomData)
    return roomData
}

function getRoomKey(roomId: string, userId: string): Uint8Array | null {
    const room = rooms.get(roomId)
    if (!room) return null

    const user = users.get(userId)
    if (!user) return null

    const encryptedKey = room.encryptedKeys.find(key => key.userId === userId)
    if (!encryptedKey) return null

    try {
        return decryptRoomKeyForUser(encryptedKey, user.privateKey)
    } catch (error) {
        return null
    }
}

function addUserToRoom(roomId: string, userId: string) {
    const room = rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)

    const user = users.get(userId)
    if (!user) throw new Error(`User ${userId} not found`)

    const roomKey = getRoomKey(roomId, 'admin')
    if (!roomKey) throw new Error('Cannot get room key')

    const newParticipant = { userId, publicKey: user.publicKey }
    const updatedEncryptedKeys = addParticipantToRoom(roomKey, newParticipant, room.encryptedKeys)

    room.encryptedKeys = updatedEncryptedKeys
    room.updatedAt = Date.now()
}

function removeUserFromRoom(roomId: string, userId: string) {
    const room = rooms.get(roomId)
    if (!room) throw new Error(`Room ${roomId} not found`)

    const roomKey = getRoomKey(roomId, 'admin')
    if (!roomKey) throw new Error('Cannot get room key')

    const remainingParticipants = room.encryptedKeys
        .filter(key => key.userId !== userId)
        .map(key => {
            const user = users.get(key.userId)
            if (!user) throw new Error(`User ${key.userId} not found`)
            return { userId: key.userId, publicKey: user.publicKey }
        })

    const updatedEncryptedKeys = removeParticipantFromRoom(roomKey, remainingParticipants)

    room.encryptedKeys = updatedEncryptedKeys
    room.updatedAt = Date.now()
}

describe("group chat encryption", () => {
    beforeEach(() => {
        rooms = new Map()
        users = new Map()

        createUser('admin')
        createUser('alice')
        createUser('bob')
        createUser('charlie')
    })

    test("should create room with multiple participants", () => {
        const roomData = createRoom('room1', ['admin', 'alice', 'bob'])

        expect(roomData.roomId).toBe('room1')
        expect(roomData.encryptedKeys).toHaveLength(3)
        expect(roomData.encryptedKeys.map(k => k.userId)).toEqual(['admin', 'alice', 'bob'])
    })

    test("all participants should be able to decrypt room key", () => {
        createRoom('room1', ['admin', 'alice', 'bob'])

        const adminKey = getRoomKey('room1', 'admin')
        const aliceKey = getRoomKey('room1', 'alice')
        const bobKey = getRoomKey('room1', 'bob')

        expect(adminKey).not.toBeNull()
        expect(aliceKey).not.toBeNull()
        expect(bobKey).not.toBeNull()

        expect(adminKey).toEqual(aliceKey)
        expect(aliceKey).toEqual(bobKey)
    })

    test("should add new participant to existing room", () => {
        createRoom('room1', ['admin', 'alice', 'bob'])

        const room = rooms.get('room1')!
        expect(room.encryptedKeys).toHaveLength(3)

        addUserToRoom('room1', 'charlie')

        expect(room.encryptedKeys).toHaveLength(4)
        expect(room.encryptedKeys.map(k => k.userId)).toContain('charlie')

        const charlieKey = getRoomKey('room1', 'charlie')
        expect(charlieKey).not.toBeNull()

        const adminKey = getRoomKey('room1', 'admin')
        expect(charlieKey).toEqual(adminKey)
    })

    test("should remove participant from room", () => {
        createRoom('room1', ['admin', 'alice', 'bob'])

        const room = rooms.get('room1')!
        expect(room.encryptedKeys).toHaveLength(3)
        expect(room.encryptedKeys.map(k => k.userId)).toContain('bob')

        removeUserFromRoom('room1', 'bob')

        expect(room.encryptedKeys).toHaveLength(2)
        expect(room.encryptedKeys.map(k => k.userId)).not.toContain('bob')

        const bobKeyAfterRemoval = getRoomKey('room1', 'bob')
        expect(bobKeyAfterRemoval).toBeNull()

        const adminKeyAfter = getRoomKey('room1', 'admin')
        const aliceKeyAfter = getRoomKey('room1', 'alice')

        expect(adminKeyAfter).not.toBeNull()
        expect(aliceKeyAfter).not.toBeNull()
        expect(adminKeyAfter).toEqual(aliceKeyAfter)
    })

    test("should handle complex room operations", () => {
        createRoom('room1', ['admin', 'alice'])

        addUserToRoom('room1', 'bob')

        const adminKey = getRoomKey('room1', 'admin')
        const aliceKey = getRoomKey('room1', 'alice')
        const bobKey = getRoomKey('room1', 'bob')

        expect(adminKey).not.toBeNull()
        expect(aliceKey).not.toBeNull()
        expect(bobKey).not.toBeNull()
        expect(adminKey).toEqual(aliceKey)
        expect(aliceKey).toEqual(bobKey)

        removeUserFromRoom('room1', 'alice')

        const aliceKeyAfter = getRoomKey('room1', 'alice')
        expect(aliceKeyAfter).toBeNull()

        const adminKeyAfter = getRoomKey('room1', 'admin')
        const bobKeyAfter = getRoomKey('room1', 'bob')

        expect(adminKeyAfter).not.toBeNull()
        expect(bobKeyAfter).not.toBeNull()
        expect(adminKeyAfter).toEqual(bobKeyAfter)

        addUserToRoom('room1', 'charlie')

        const charlieKey = getRoomKey('room1', 'charlie')
        expect(charlieKey).not.toBeNull()
        expect(charlieKey).toEqual(adminKeyAfter)
    })

    test("should handle multiple rooms", () => {
        createRoom('room1', ['admin', 'alice'])
        createRoom('room2', ['admin', 'bob'])

        const room1Key = getRoomKey('room1', 'admin')
        const room2Key = getRoomKey('room2', 'admin')

        expect(room1Key).not.toBeNull()
        expect(room2Key).not.toBeNull()
        expect(room1Key).not.toEqual(room2Key)

        const aliceRoom1Key = getRoomKey('room1', 'alice')
        const bobRoom2Key = getRoomKey('room2', 'bob')

        expect(aliceRoom1Key).toEqual(room1Key)
        expect(bobRoom2Key).toEqual(room2Key)

        const aliceRoom2Key = getRoomKey('room2', 'alice')
        const bobRoom1Key = getRoomKey('room1', 'bob')

        expect(aliceRoom2Key).toBeNull()
        expect(bobRoom1Key).toBeNull()
    })

    test("should handle room key rotation", () => {
        createRoom('room1', ['admin', 'alice', 'bob'])

        const originalAdminKey = getRoomKey('room1', 'admin')
        const originalAliceKey = getRoomKey('room1', 'alice')
        const originalBobKey = getRoomKey('room1', 'bob')

        expect(originalAdminKey).not.toBeNull()
        expect(originalAdminKey).toEqual(originalAliceKey)
        expect(originalAliceKey).toEqual(originalBobKey)

        const newRoomKey = generateRoomKey()
        const participants = [
            { userId: 'admin', publicKey: users.get('admin')!.publicKey },
            { userId: 'alice', publicKey: users.get('alice')!.publicKey },
            { userId: 'bob', publicKey: users.get('bob')!.publicKey }
        ]

        const newEncryptedKeys = createEncryptedRoomKeys(newRoomKey, participants)

        const room = rooms.get('room1')!
        room.encryptedKeys = newEncryptedKeys
        room.updatedAt = Date.now()

        const newAdminKey = getRoomKey('room1', 'admin')
        const newAliceKey = getRoomKey('room1', 'alice')
        const newBobKey = getRoomKey('room1', 'bob')

        expect(newAdminKey).not.toBeNull()
        expect(newAdminKey).toEqual(newAliceKey)
        expect(newAliceKey).toEqual(newBobKey)

        expect(newAdminKey).not.toEqual(originalAdminKey)
    })

    test("should handle errors gracefully", () => {
        expect(() => {
            createRoom('room1', ['admin', 'nonexistent'])
        }).toThrow('User nonexistent not found')

        const nonExistentKey = getRoomKey('nonexistent', 'admin')
        expect(nonExistentKey).toBeNull()

        createRoom('room1', ['admin', 'alice'])
        const nonExistentUserKey = getRoomKey('room1', 'nonexistent')
        expect(nonExistentUserKey).toBeNull()

        expect(() => {
            addUserToRoom('room1', 'nonexistent')
        }).toThrow('User nonexistent not found')

        expect(() => {
            addUserToRoom('nonexistent', 'charlie')
        }).toThrow('Room nonexistent not found')
    })
}) 
