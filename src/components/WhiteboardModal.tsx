"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, Save, Share2 } from "lucide-react";

// Dynamically import Excalidraw to prevent SSR window errors
const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((mod) => mod.Excalidraw),
  { ssr: false }
);

interface WhiteboardModalProps {
  doubtId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function WhiteboardModal({ doubtId, isOpen, onClose }: WhiteboardModalProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isCollaborating, setIsCollaborating] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const startCollaboration = () => {
    setIsCollaborating(true);
    // In a real implementation, you would emit a WebSocket event via Socket.io here 
    // to create a room using doubtId as the room key.
    console.log(`Starting collaboration session for Doubt #${doubtId}`);
  };

  const handleSave = async () => {
    if (!excalidrawAPI) return;
    
    // Simulate saving the whiteboard state
    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    
    console.log("Saving whiteboard data:", { elements, appState });
    alert("Whiteboard saved! In a full implementation, this attaches to the doubt.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-[95vw] max-h-[90vh] bg-background border rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div>
            <h2 className="text-lg font-bold">Live Whiteboard - Doubt #{doubtId}</h2>
            <p className="text-xs text-muted-foreground">
              {isCollaborating ? "🟢 Live session active" : "Offline mode - Start collaboration to sync with mentor"}
            </p>
          </div>
          <div className="flex gap-2">
            {!isCollaborating && (
              <button 
                onClick={startCollaboration}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Share2 className="w-4 h-4" /> Go Live
              </button>
            )}
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-md hover:bg-accent"
            >
              <Save className="w-4 h-4" /> Save Snapshot
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 ml-2 text-muted-foreground hover:bg-accent rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Canvas Container */}
        <div className="flex-1 w-full h-full overflow-hidden bg-white">
          <Excalidraw 
            excalidrawAPI={(api: any) => setExcalidrawAPI(api)} 
            theme="light"
            UIOptions={{
               canvasActions: {
                 changeViewBackgroundColor: true,
                 clearCanvas: true,
                 saveAsImage: true,
               }
            }}
          />
        </div>
      </div>
    </div>
  );
}
