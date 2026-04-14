/**
 * Conference Tracker (Phase 7)
 *
 * Tracks rooms, participants, and their spoken languages based on
 * webhook events from Prosody's mod_event_sync_component.
 */
import { EventEmitter } from "events";
import { TrackedRoom, RoomCreatedEvent, RoomDestroyedEvent, OccupantJoinedEvent, OccupantLeftEvent, OccupantLanguageChangedEvent } from "./types";
export declare class ConferenceTracker extends EventEmitter {
    private rooms;
    constructor();
    /**
     * Handle room creation.
     */
    onRoomCreated(event: RoomCreatedEvent): void;
    /**
     * Handle room destruction.
     */
    onRoomDestroyed(event: RoomDestroyedEvent): void;
    /**
     * Handle occupant joining.
     */
    onOccupantJoined(event: OccupantJoinedEvent): void;
    /**
     * Handle occupant leaving.
     */
    onOccupantLeft(event: OccupantLeftEvent): void;
    /**
     * Handle occupant language change. This is the primary trigger for spawn decisions.
     */
    onLanguageChanged(event: OccupantLanguageChangedEvent): void;
    /**
     * Ensures a room exists in the tracker. If not found, auto-creates it.
     * Handles cases where webhook events arrive for rooms we missed the
     * room-created event for (e.g., orchestrator restart while conferences are active).
     */
    private ensureRoom;
    /**
     * Get a tracked room by name.
     */
    getRoom(roomName: string): TrackedRoom | undefined;
    /**
     * Get unique spoken languages in a room (excluding null/empty).
     */
    getRoomLanguages(roomName: string): Set<string>;
    /**
     * Get the total participant count for a room.
     */
    getParticipantCount(roomName: string): number;
    /**
     * Get all tracked rooms.
     */
    getAllRooms(): TrackedRoom[];
    /**
     * Serialize all rooms to a plain object for JSON responses.
     */
    toJSON(): Record<string, unknown>[];
}
//# sourceMappingURL=ConferenceTracker.d.ts.map