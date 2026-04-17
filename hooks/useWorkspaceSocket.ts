"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { RealtimeChannel } from "@supabase/supabase-js"

export function useWorkspaceSocket(workspaceId: string) {
    const [isConnected, setIsConnected] = useState<boolean>(false)
    // We create a state to hold the actual radio channel
    const [channel, setChannel] = useState<RealtimeChannel | null>(null)

    useEffect(() => {
        if (!workspaceId || workspaceId === "new") return;

        const myChannel = supabase.channel(`workspace-${workspaceId}`, {
            config: {
                presence: {
                    key: 'cursor', // We are tracking cursor data
                },
            },
        })

        myChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                setIsConnected(true)
                setChannel(myChannel) // Hand the channel to React
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

    // Now we return both the connection status AND the channel itself
    return { isConnected, channel }
}