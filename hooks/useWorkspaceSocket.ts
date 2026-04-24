"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { RealtimeChannel } from "@supabase/supabase-js"
import { useAppStore } from "@/lib/store"

export function useWorkspaceSocket(workspaceId: string) {
    const [isConnected, setIsConnected] = useState<boolean>(false)
 
    const [channel, setChannel] = useState<RealtimeChannel | null>(null)
    const [cursors, setCursors] = useState<Record<string, {x : number, y : number}>>({})

    useEffect(() => {
        if (!workspaceId || workspaceId === "new") return;

        const myChannel = supabase.channel(`workspace-${workspaceId}`, {
            config: {
                presence: {
                    key: 'cursor', 
                },
            },
        })

        myChannel.on(
            'broadcast',
            {event : 'cursor-move'},
            (incoming) => {
                const {x, y, userId} = incoming.payload;

                setCursors((prev) => ({
                    ...prev, 
                    [userId] : {x, y}
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

        myChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                setIsConnected(true)
                setChannel(myChannel) 
                console.log(`📡 [NETWORK] Successfully subscribed to workspace-${workspaceId}`)
            }
            if (status === 'CLOSED') {
                setIsConnected(false)
                setChannel(null)
            }
        })

        return () => {
            supabase.removeChannel(myChannel)
        }
    }, [workspaceId])

    return { isConnected, channel, cursors };
}