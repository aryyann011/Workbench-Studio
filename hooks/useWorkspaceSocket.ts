"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { RealtimeChannel } from "@supabase/supabase-js"
import { useAppStore } from "@/lib/store"

export function broadcastTimelineSync(workspaceId: string) {
    const channelName = `workspace-${workspaceId}`;
    const channel = supabase.getChannels().find(c => c.name === channelName);
    if (!channel) return;
    const { nodes, edges } = useAppStore.getState();
    channel.send({
        type: 'broadcast',
        event: 'sync-timeline',
        payload: { nodes, edges }
    });
}

export function useWorkspaceSocket(workspaceId: string, currentUserId?: string | null) {
    const [isConnected, setIsConnected] = useState<boolean>(false)
 
    const [channel, setChannel] = useState<RealtimeChannel | null>(null)
    const [cursors, setCursors] = useState<Record<string, {x : number, y : number, lastUpdated: number}>>({})
    const [presence, setPresence] = useState<Record<string, any>>({})

    // Broadcast full state to all connected clients (for AI generation, code changes, etc.)
    const broadcastSync = useCallback(() => {
        if (!channel || !isConnected) return;
        const { nodes, edges } = useAppStore.getState();
        channel.send({
            type: 'broadcast',
            event: 'sync-timeline',
            payload: { nodes, edges }
        });
    }, [channel, isConnected]);

    useEffect(() => {
        if (!workspaceId || workspaceId === "new") return;

        const myChannel = supabase.channel(`workspace-${workspaceId}`, {
            config: {
                presence: {
                    key: currentUserId || 'anonymous', 
                },
            },
        })

        myChannel.on('presence', { event: 'sync' }, () => {
            const state = myChannel.presenceState();
            setPresence(state);
        });

        myChannel.on(
            'broadcast',
            {event : 'cursor-move'},
            (incoming) => {
                const {x, y, userId} = incoming.payload;
                
                // Filter out our own cursor from other tabs/windows
                if (currentUserId && userId === currentUserId) return;

                setCursors((prev) => ({
                    ...prev, 
                    [userId] : {x, y, lastUpdated: Date.now()}
                }))
            }
        )

        myChannel.on(
            'broadcast',
            {event : 'node-move'},
            (incoming) => {
                const {nodeId, position} = incoming.payload;
                useAppStore.getState().handleRealtimeChanges(nodeId, position);

            }
        )
        myChannel.on(
            'broadcast',
            {event : 'edge-create'},
            (incoming) => {
                const {Connection} = incoming.payload
                useAppStore.getState().onConnect(Connection)
            }
        )

        myChannel.on(
            'broadcast',
            {event : 'node-delete'},
            (incoming) => {
                const {nodeId, userId} = incoming.payload
                useAppStore.getState().removeNodeRemotely(nodeId)
            }
        )

        myChannel.on(
            'broadcast',
            {event : 'sync-timeline'},
            (incoming) => {
                const {nodes, edges} = incoming.payload
                useAppStore.getState().SetTheGraph(nodes, edges)
            }
        )

        myChannel.on(
            'broadcast',
            {event : 'node-start'},
            (incoming) => {
                const {nodeId, userId} = incoming.payload;
                useAppStore.getState().handleNodeStart(nodeId, userId)
            }
        )

        myChannel.on(
            'broadcast',
            {event : 'node-stop'},
            (incoming) => {
                const {nodeId} = incoming.payload
                useAppStore.getState().handleNodeStop(nodeId)
            }
        )

        myChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                setIsConnected(true)
                setChannel(myChannel) 
                console.log(`📡 [NETWORK] Successfully subscribed to workspace-${workspaceId}`)
                
                if (currentUserId) {
                    myChannel.track({ userId: currentUserId, onlineAt: new Date().toISOString() });
                }
            }
            if (status === 'CLOSED') {
                setIsConnected(false)
                setChannel(null)
            }
        })

        // Cleanup stale cursors after 3 seconds of inactivity
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            setCursors(prev => {
                const next = { ...prev };
                let changed = false;
                for (const id in next) {
                    if (now - next[id].lastUpdated > 3000) {
                        delete next[id];
                        changed = true;
                    }
                }
                return changed ? next : prev;
            });
        }, 1000);

        return () => {
            clearInterval(cleanupInterval);
            supabase.removeChannel(myChannel)
        }
    }, [workspaceId, currentUserId])

    return { isConnected, channel, cursors, presence, broadcastSync };
}