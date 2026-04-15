"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useWorkspaceSocket(workspaceId: string) {
    const [isConnected, setIsConnected] = useState<boolean>(false)

    useEffect(() => {
        
        if (!workspaceId || workspaceId === "new") {
            console.log("No valid workspace ID. Network standing by.")
            return;
        }

        const myChannel = supabase.channel(`workspace-${workspaceId}`)

        myChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                setIsConnected(true)
                console.log(`📡 [NETWORK] Successfully subscribed to workspace-${workspaceId}`)
            }
            if (status === 'CLOSED') {
                setIsConnected(false)
                console.log(`🔌 [NETWORK] Disconnected.`)
            }
        })

       
        return () => {
            supabase.removeChannel(myChannel)
        }
    }, [workspaceId]) 

    return { isConnected }
}