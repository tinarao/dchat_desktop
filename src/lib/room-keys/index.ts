// Raw room keys storage module
// As user create rooms, raw room keys need to be stored somewhere
// Then encrypted and shared between users in room

import { load } from "@tauri-apps/plugin-store";
import { STORE_FILE_PATH } from "../constants";
import { base64ToUint8, Bytes, uint8ToBase64 } from "../encr";

const RAW_ROOM_KEYS_STORE_KEY = "raw-room-keys" as const;
type RawRoomKeysStorage = Record<number, string>;

export async function saveRawRoomKey(key: Bytes, roomId: number) {
    const store = await load(STORE_FILE_PATH, {
        autoSave: false,
    });

    let historyMap: RawRoomKeysStorage = {};
    const has = await store.has(RAW_ROOM_KEYS_STORE_KEY);
    if (has) {
        const saved = await store.get<RawRoomKeysStorage>(RAW_ROOM_KEYS_STORE_KEY);
        if (saved) historyMap = saved;
    }

    const keyBase64 = uint8ToBase64(key);
    historyMap[roomId] = keyBase64;
    await store.set(RAW_ROOM_KEYS_STORE_KEY, historyMap);
    await store.save();
}

export async function getRawRoomKey(
    roomId: number
): Promise<Bytes | undefined> {
    const store = await load(STORE_FILE_PATH, {
        autoSave: false,
    });

    const map = await store.get<RawRoomKeysStorage>(RAW_ROOM_KEYS_STORE_KEY);
    if (!map) return undefined;
    const key = map[roomId];
    if (!key) return undefined;

    return base64ToUint8(key);
}
