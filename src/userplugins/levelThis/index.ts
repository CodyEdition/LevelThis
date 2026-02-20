/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChatBarButton } from "@api/ChatButtons";
import { definePluginSettings } from "@api/Settings";
import authorImgBase64 from "file://./author.png?base64";
import { findStore, findByProps, findByCode } from "@webpack";
import definePlugin, { makeRange, OptionType } from "@utils/types";
import { FluxDispatcher, React, showToast } from "@webpack/common";
import { Logger } from "@utils/Logger";

const logger = new Logger("LevelThis");

/** Data URL for the plugin author avatar (used in Settings > Plugins > LevelThis > Authors) */
const AUTHOR_AVATAR_DATA_URL = "data:image/png;base64," + authorImgBase64;

/** Set as soon as module loads so the PluginModal can show our avatar even when the plugin is disabled */
try {
  if (typeof window !== "undefined" && (window as any).__LEVELTHIS_AUTHOR_AVATAR__ === undefined && typeof AUTHOR_AVATAR_DATA_URL === "string") {
    (window as any).__LEVELTHIS_AUTHOR_AVATAR__ = AUTHOR_AVATAR_DATA_URL;
  }
} catch (_) { /* ignore */ }

const settings = definePluginSettings({
    LevelEveryoneTheSameVolume: {
        type: OptionType.BOOLEAN,
        description: "Levels everyone to same volume instead of their own individual volume.",
        default: false
    },
    targetVolume: {
        type: OptionType.SLIDER,
        description: "Target volume (%). (100 = Discord default.)",
        markers: [50, 75, 100, 125, 150, 175, 200],
        default: 100,
        stickToMarkers: false
    },
    checkIntervalSeconds: {
        type: OptionType.SLIDER,
        description: "Seconds between volume checks. (Lower = more responsive, higher = less CPU usage.)",
        markers: makeRange(1, 30, 1),
        default: 15,
        stickToMarkers: true
    },
    maxParticipants: {
        type: OptionType.SLIDER,
        description: "Auto-pause when call exceeds maximum participants (0 = no limit).",
        markers: [0, 5, 10, 15, 20, 25, 30, 40, 50],
        default: 20,
        stickToMarkers: true
    },
    devLogging: {
        type: OptionType.BOOLEAN,
        description: "Verbose logging to console for debugging",
        default: false
    },
    exemptUserIds: {
        type: OptionType.STRING,
        description: "User IDs to exempt (Comma-separated e.g. 123,456)",
        default: ""
    }
});

// Volume API resolution (Todo 2)
let MediaEngineStore: MediaEngineStoreLike | null = null;
let MediaEngineActions: MediaEngineActionsLike | null = null;
let AudioConvert: any;

// Voice context resolution (Todo 3)
let VoiceStateStore: any;
let UserStore: any;

// State management
let levelingInterval: NodeJS.Timeout | null = null;
let voiceStateDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
let voiceStateUnsubscribe: (() => void) | null = null;
let voiceStateUpdateUnsubscribe: (() => void) | null = null;
let isLeveling = false;
/** Bypass participant limit per guild/channel (persists until leaving that channel) */
const bypassByGuildOrChannel = new Map<string, boolean>();
/** Last channel key when in a call (used to clear bypass on leave) */
let lastContextKey: string | null = null;
/** Last time we showed the "auto-paused" toast (to avoid spamming) */
let lastPauseToastTime = 0;
const PAUSE_TOAST_COOLDOWN_MS = 60_000;

/** Last time we logged a timer tick (rate-limit dev logs) */
let lastTickLogTime = 0;
const TICK_LOG_INTERVAL_MS = 10_000;
/** Last time we logged "no participants" skip (reduce console noise when alone) */
let lastNoParticipantsLogTime = 0;
const NO_PARTICIPANTS_LOG_COOLDOWN_MS = 30_000;

/** Tag for console filter: type "LevelThis" in DevTools filter to see all plugin logs */
const LOG_TAG = "LevelThis";

interface MediaEngineStoreLike {
    getLocalVolume?(userId: string, context?: string): number;
}
interface MediaEngineActionsLike {
    setLocalVolume(userId: string, volume: number, context?: unknown): void;
}

function devLog(message: string, data?: Record<string, unknown>): void {
    if (settings.store.devLogging) {
        const payload = data ? ` ${JSON.stringify(data)}` : "";
        logger.info(`${LOG_TAG} ${message}${payload}`);
    }
}

/**
 * Resolve Discord's volume API modules
 * Returns true if all required modules were found
 */
function resolveVolumeAPI(): boolean {
    try {
        // Find MediaEngineStore (contains getLocalVolume)
        MediaEngineStore = findStore("MediaEngineStore");
        if (!MediaEngineStore) {
            logger.error(`${LOG_TAG} MediaEngineStore not found`);
            return false;
        }

        // Find MediaEngineActions (contains setLocalVolume)
        MediaEngineActions = findByProps("setLocalVolume");
        if (!MediaEngineActions?.setLocalVolume) {
            // Try alternative: findByCode if prop name is minified
            const altActions = findByCode("setLocalVolume");
            if (altActions) {
                MediaEngineActions = altActions;
            } else {
                logger.error(`${LOG_TAG} setLocalVolume not found`);
                return false;
            }
        }

        // Try to find audio conversion utilities (perceptual/amplitude)
        // This is optional - we'll work with whatever scale Discord uses
        try {
            AudioConvert = findByCode("amplitudeToPerceptual", "perceptualToAmplitude") ||
                          findByCode("Math.log10", "Math.pow(10");
        } catch {
            // Not critical - we'll use the volume as-is
            logger.warn(`${LOG_TAG} AudioConvert utilities not found, using direct volume values`);
        }

        logger.info(`${LOG_TAG} Volume API resolved successfully`);
        return true;
    } catch (error) {
        logger.error(`${LOG_TAG} Failed to resolve volume API:`, error);
        return false;
    }
}

/**
 * Resolve Discord's voice context and participant list modules
 * Returns true if all required modules were found
 */
function resolveVoiceContext(): boolean {
    try {
        // Find VoiceStateStore (tracks who's in voice channels)
        VoiceStateStore = findStore("VoiceStateStore");
        if (!VoiceStateStore) {
            logger.error(`${LOG_TAG} VoiceStateStore not found`);
            return false;
        }

        // Find UserStore (to get current user ID)
        UserStore = findStore("UserStore");
        if (!UserStore) {
            logger.error(`${LOG_TAG} UserStore not found`);
            return false;
        }

        logger.info(`${LOG_TAG} Voice context API resolved successfully`);
        return true;
    } catch (error) {
        logger.error(`${LOG_TAG} Failed to resolve voice context API:`, error);
        return false;
    }
}

/**
 * Get current voice channel context
 * Returns { channelId, guildId } or null if not in a voice channel
 */
function getCurrentVoiceContext(): { channelId: string; guildId: string | null } | null {
    try {
        const userId = UserStore.getCurrentUser()?.id;
        if (!userId) return null;
        const voiceState = VoiceStateStore.getVoiceStateForUser(userId);
        if (!voiceState?.channelId) {
            return null;
        }

        return {
            channelId: voiceState.channelId,
            guildId: voiceState.guildId || null
        };
    } catch (error) {
        logger.error(`${LOG_TAG} Failed to get voice context:`, error);
        return null;
    }
}

/**
 * Get list of user IDs in the current voice channel (excluding self)
 */
function getParticipantUserIds(): string[] {
    try {
        const context = getCurrentVoiceContext();
        if (!context) {
            return [];
        }

        const currentUserId = UserStore.getCurrentUser()?.id;
        if (!currentUserId) {
            return [];
        }

        // Get all voice states for the current channel
        const voiceStates = VoiceStateStore.getVoiceStatesForChannel(context.channelId);
        if (!voiceStates) {
            return [];
        }

        // Extract user IDs, excluding self
        const userIds = Object.keys(voiceStates).filter(userId => userId !== currentUserId);
        return userIds;
    } catch (error) {
        logger.error(`${LOG_TAG} Failed to get participant user IDs:`, error);
        return [];
    }
}

/**
 * Parse comma-separated user IDs into a Set for fast lookup
 */
function parseExemptUserIds(raw: string): Set<string> {
    if (!raw || typeof raw !== "string") return new Set();
    return new Set(raw.split(",").map(s => s.trim()).filter(Boolean));
}

/**
 * Convert target volume percentage to Discord's internal volume scale
 * Discord uses amplitude (0-1) internally, but UI shows perceptual scale (0-200%)
 * If AudioConvert is available, use it; otherwise assume direct percentage
 */
function convertToInternalVolume(percentage: number): number {
    if (AudioConvert?.perceptualToAmplitude) {
        // Convert from percentage (0-200) to amplitude (0-1)
        return AudioConvert.perceptualToAmplitude(percentage / 100);
    }
    // Fallback: assume percentage is already in the right scale
    // BetterVolume suggests Discord uses amplitude internally
    // So we'll convert percentage to 0-1 range
    return Math.max(0, Math.min(1, percentage / 100));
}

/**
 * Apply leveling to all participants in current voice channel
 */
function applyLeveling(): void {
    if (isLeveling) {
        devLog("applyLeveling skipped", { reason: "concurrent call" });
        return;
    }
    if (!settings.store.enabled) {
        devLog("applyLeveling skipped", { reason: "plugin disabled" });
        return;
    }

    // Robustness check (Todo 8)
    if (!MediaEngineStore || !MediaEngineActions?.setLocalVolume) {
        logger.warn(`${LOG_TAG} Volume API not available, skipping leveling`);
        devLog("applyLeveling skipped", { reason: "Volume API not available" });
        return;
    }

    const context = getCurrentVoiceContext();
    if (!context) {
        if (lastContextKey) {
            bypassByGuildOrChannel.delete(lastContextKey);
            lastContextKey = null;
        }
        lastPauseToastTime = 0;
        devLog("applyLeveling skipped", { reason: "not in voice channel" });
        return;
    }
    lastContextKey = context.guildId ?? context.channelId;
    const bypassParticipantLimit = bypassByGuildOrChannel.get(lastContextKey) ?? false;

    const participantIds = getParticipantUserIds();
    const exemptIds = parseExemptUserIds(settings.store.exemptUserIds ?? "");
    const levelingIds = participantIds.filter(id => !exemptIds.has(id));
    if (levelingIds.length === 0) {
        const now = Date.now();
        if (now - lastNoParticipantsLogTime >= NO_PARTICIPANTS_LOG_COOLDOWN_MS) {
            lastNoParticipantsLogTime = now;
            devLog("applyLeveling skipped", {
                reason: participantIds.length === 0 ? "no other participants" : "all participants exempt",
                channelId: context.channelId
            });
        }
        return;
    }

    const maxParticipants = settings.store.maxParticipants ?? 0;
    if (maxParticipants > 0 && participantIds.length > maxParticipants && !bypassParticipantLimit) {
        const now = Date.now();
        if (now - lastPauseToastTime >= PAUSE_TOAST_COOLDOWN_MS) {
            lastPauseToastTime = now;
            showToast(`LevelThis paused: ${participantIds.length} people in call (max ${maxParticipants}). Leave and rejoin or re-enable in settings to level again.`, 0); // MESSAGE type
            logger.info(`${LOG_TAG} auto-paused: ${participantIds.length} participants > ${maxParticipants}`);
            devLog("paused: over participant limit", { participants: participantIds.length, maxParticipants });
        }
        devLog("applyLeveling skipped", { reason: "auto-paused", participants: participantIds.length, maxParticipants });
        return;
    }
    isLeveling = true;
    const targetVolumePct = settings.store.targetVolume;
    const targetVolume = convertToInternalVolume(targetVolumePct);
    devLog("applyLeveling running", {
        channelId: context.channelId,
        guildId: context.guildId ?? null,
        participants: levelingIds.length,
        targetVolumePct,
        targetVolumeInternal: targetVolume
    });

    try {
        // Apply target volume to all participants (excluding exempt)
        const VOLUME_TOLERANCE_PCT = 2;
        for (const userId of levelingIds) {
            try {
                const current = MediaEngineStore?.getLocalVolume?.(userId);
                if (typeof current === "number" && Math.abs(current - targetVolumePct) < VOLUME_TOLERANCE_PCT) {
                    continue; // Already at target, skip
                }

                // Try different context formats that Discord might expect
                // Format 1: Just channelId (for DMs)
                // Format 2: { channelId, guildId } (for guild channels)
                // Format 3: channelId string
                let volumeContext: any = context.channelId;

                if (context.guildId) {
                    // Try object format first
                    volumeContext = { channelId: context.channelId, guildId: context.guildId };
                }

                MediaEngineActions.setLocalVolume(userId, targetVolume, volumeContext);
                devLog("setLocalVolume", { userId: userId.slice(-8), targetVolumeInternal: targetVolume });
            } catch (error) {
                if (error instanceof Error && !error.message.includes("not found")) {
                    logger.debug(`${LOG_TAG} Failed to set volume for user ${userId}:`, error);
                }
                devLog("setLocalVolume failed", { userId: userId.slice(-8), error: error instanceof Error ? error.message : String(error) });
            }
        }
        devLog("applyLeveling done", { count: levelingIds.length });
    } catch (error) {
        logger.error(`${LOG_TAG} Error during leveling:`, error);
        devLog("applyLeveling error", { error: error instanceof Error ? error.message : String(error) });
    } finally {
        isLeveling = false;
    }
}

/**
 * Start the leveling interval only when in a voice channel; clear it when not.
 * Saves performance by not ticking when the user is not in a call.
 */
function startLevelingInterval(): void {
    if (levelingInterval) {
        clearInterval(levelingInterval);
        levelingInterval = null;
    }
    if (!settings.store.enabled) return;
    const context = getCurrentVoiceContext();
    if (!context) return;
    const ms = (settings.store.checkIntervalSeconds ?? 2) * 1000;
    levelingInterval = setInterval(() => {
        if (!settings.store.enabled) return;
        if (!getCurrentVoiceContext()) return; // left call, interval will be cleared on next voice state
        const now = Date.now();
        if (settings.store.devLogging && now - lastTickLogTime >= TICK_LOG_INTERVAL_MS) {
            lastTickLogTime = now;
            devLog("timer tick: applying leveling");
        }
        applyLeveling();
    }, ms);
    devLog("leveling interval started (in call)", { intervalMs: ms });
}

/**
 * Stop the leveling interval (e.g. when leaving a call).
 */
function stopLevelingInterval(): void {
    if (levelingInterval) {
        clearInterval(levelingInterval);
        levelingInterval = null;
        devLog("leveling interval stopped (left call)");
    }
}

/**
 * Handle voice state updates (user joins/leaves)
 */
function handleVoiceStateUpdate(): void {
    if (!settings.store.enabled) return;
    if (voiceStateDebounceTimeout) clearTimeout(voiceStateDebounceTimeout);
    devLog("voice state update: scheduling leveling");
    voiceStateDebounceTimeout = setTimeout(() => {
        voiceStateDebounceTimeout = null;
        const context = getCurrentVoiceContext();
        if (context) {
            startLevelingInterval();
            applyLeveling();
        } else {
            if (lastContextKey) {
                bypassByGuildOrChannel.delete(lastContextKey);
                lastContextKey = null;
            }
            stopLevelingInterval();
        }
    }, 100);
}

export default definePlugin({
    name: "LevelThis",
    description: "Automatically levels all voice participants to the same volume",
    authors: [{ name: "thatcodyguy", id: 0n }],
    settings,

    start() {
        try {
            (window as any).__LEVELTHIS_AUTHOR_AVATAR__ = AUTHOR_AVATAR_DATA_URL;
        } catch (_) { /* non-fatal: author avatar may not show in settings */ }
        // Resolve APIs (Todos 2 & 3) with error handling (Todo 8)
        try {
            if (!resolveVolumeAPI()) {
                logger.error(`${LOG_TAG} Failed to resolve volume API. Plugin disabled.`);
                // Don't throw - gracefully degrade
                return;
            }

            if (!resolveVoiceContext()) {
                logger.error(`${LOG_TAG} Failed to resolve voice context API. Plugin disabled.`);
                return;
            }
        } catch (error) {
            logger.error(`${LOG_TAG} Critical error during API resolution:`, error);
            return;
        }

        // Apply leveling immediately if already in a voice channel
        if (settings.store.enabled) {
            applyLeveling();
        }

        // Subscribe to voice state updates (Todo 4)
        voiceStateUnsubscribe = FluxDispatcher.subscribe("VOICE_STATE_UPDATES", handleVoiceStateUpdate);
        voiceStateUpdateUnsubscribe = FluxDispatcher.subscribe("VOICE_STATE_UPDATE", handleVoiceStateUpdate);

        // Subscribe to settings changes (Todo 5) - guard for environments where .on is not available
        const storeOn = settings.store?.on;
        if (typeof storeOn === "function") {
            try {
                storeOn.call(settings.store, "enabled", (newValue: boolean) => {
                    if (newValue) {
                        const context = getCurrentVoiceContext();
                        const participantIds = getParticipantUserIds();
                        const maxParticipants = settings.store.maxParticipants ?? 0;
                        if (context && maxParticipants > 0 && participantIds.length > maxParticipants) {
                            const key = context.guildId ?? context.channelId;
                            bypassByGuildOrChannel.set(key, true);
                            showToast("LevelThis: Re-enabled and bypassing participant limit for this call.", 0);
                            logger.info(`${LOG_TAG} User bypassed participant limit`);
                            devLog("bypass: re-enabled over participant limit", { participants: participantIds.length, maxParticipants });
                        }
                        devLog("settings changed: enabled=true, re-running leveling");
                        startLevelingInterval(); // start interval if in call; no-op if not
                        applyLeveling();
                    } else {
                        stopLevelingInterval();
                    }
                });

                storeOn.call(settings.store, "targetVolume", () => {
                    if (settings.store.enabled) {
                        devLog("settings changed: targetVolume, re-running leveling");
                        applyLeveling();
                    }
                });

                storeOn.call(settings.store, "checkIntervalSeconds", startLevelingInterval);
            } catch (error) {
                logger.warn(`${LOG_TAG} Failed to subscribe to settings changes:`, error);
            }
        }

        startLevelingInterval();

        logger.info(`${LOG_TAG} plugin started`);
    },

    stop() {
        // Cleanup (Todo 8)
        try {
            if (voiceStateDebounceTimeout) {
                clearTimeout(voiceStateDebounceTimeout);
                voiceStateDebounceTimeout = null;
            }
            if (levelingInterval) {
                clearInterval(levelingInterval);
                levelingInterval = null;
            }

            if (voiceStateUnsubscribe) {
                voiceStateUnsubscribe();
                voiceStateUnsubscribe = null;
            }
            if (voiceStateUpdateUnsubscribe) {
                voiceStateUpdateUnsubscribe();
                voiceStateUpdateUnsubscribe = null;
            }

            isLeveling = false;
            logger.info(`${LOG_TAG} plugin stopped`);
        } catch (error) {
            logger.error(`${LOG_TAG} Error during plugin stop:`, error);
        }
        try {
            delete (window as any).__LEVELTHIS_AUTHOR_AVATAR__;
        } catch (_) {}
    },

    dependencies: ["ChatInputButtonAPI"],

    chatBarButton: {
        icon: (props: { height?: number; width?: number; className?: string }) =>
            React.createElement("svg", { width: props?.width ?? 20, height: props?.height ?? 20, viewBox: "0 0 24 24", fill: "currentColor", className: props?.className },
                React.createElement("path", { d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" })
            ),
        render: (props: { isMainChat: boolean }) => {
            if (!props.isMainChat) return null;
            if (!getCurrentVoiceContext()) return null;
            const enabled = settings.store.enabled;
            return React.createElement(ChatBarButton, {
                tooltip: enabled ? "Disable LevelThis" : "Enable LevelThis",
                onClick: () => {
                    settings.store.enabled = !settings.store.enabled;
                }
            }, React.createElement("svg", { width: 20, height: 20, viewBox: "0 0 24 24", fill: "currentColor" },
                React.createElement("path", { d: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" })
            ));
        }
    },

    // Settings panel will be auto-generated by Vencord from definePluginSettings

    // Optional: Patch volume read path for enforcement (Todo 6)
    // This would patch the code that reads getLocalVolume to always return our target
    // when leveling is enabled. Currently not implemented as the interval-based approach
    // should be sufficient. If Discord frequently resets volumes, uncomment and implement:
    /*
    patches: [
        {
            find: "getLocalVolume",
            replacement: {
                match: /getLocalVolume\((\w+),\s*(\w+)\)/g,
                replace: (match, userId, context) => {
                    if (settings.store.enabled && getParticipantUserIds().includes(userId)) {
                        return `(${convertToInternalVolume(settings.store.targetVolume)})`;
                    }
                    return match;
                }
            }
        }
    ],
    */

    // Optional: AGC (Automatic Gain Control) - Todo 7
    // This would require finding Discord's audio level data for each user.
    // Discovery code (commented out - implement if level data is found):
    /*
    async discoverAudioLevels() {
        // Try to find audio level store or speaking indicator data
        const SpeakingStore = findStore("SpeakingStore");
        const MediaEngineStore = findStore("MediaEngineStore");
        
        // Check if MediaEngineStore has level methods
        if (MediaEngineStore?.getSpeakingLevel || MediaEngineStore?.getAudioLevel) {
            logger.info(`${LOG_TAG} Audio level data found - AGC is possible`);
            // Implement AGC loop here
        } else {
            logger.info(`${LOG_TAG} No audio level data found - AGC not possible`);
        }
    }
    */
});
