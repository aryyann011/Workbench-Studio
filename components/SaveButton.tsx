"use client"

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { saveArchitecture } from '@/actions/workspace';
import { toast } from 'sonner';

export function SaveButton() {
  const code = useAppStore((state) => state.code);
  const {nodes, edges} = useAppStore();
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!code) return; 

    setIsSaving(true);
    
    const result = await saveArchitecture(code, nodes, edges);
    
    if (result.success) {
      toast.success(`Success! Saved securely to database (ID: ${result.id})`);
    } else {
      toast.error(`Error: ${result.error}`);
    }
    
    setIsSaving(false);
  };

  return (
    <button 
      onClick={handleSave} 
      disabled={isSaving || !code}
      className="absolute bottom-4 right-22 bg-blue-600 text-white px-4 py-1 rounded-lg"
    >
      {isSaving ? "Saving to Cloud..." : "Save Code"}
    </button>
  );
}