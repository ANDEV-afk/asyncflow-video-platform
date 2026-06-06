"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import RecordingStudio from "@/components/record/RecordingStudio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mapRecordModeToType, type RecordMode } from "@/components/record/types";

type LiveKitSession = {
  token: string;
  serverUrl: string;
  roomName: string;
};

export default function LiveKitRecorder() {
  const router = useRouter();
  const [session, setSession] = useState<LiveKitSession | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordMode, setRecordMode] = useState<RecordMode>("screen-camera");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const createSession = useCallback(async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const response = await fetch("/api/livekit/token", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to connect to LiveKit.");
      }

      setSession({
        token: data.token,
        serverUrl: data.serverUrl,
        roomName: data.roomName,
      });
    } catch (error) {
      setConnectionError(
        error instanceof Error ? error.message : "Failed to connect to LiveKit."
      );
      setSession(null);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  useEffect(() => {
    createSession();
  }, [createSession, sessionKey]);

  const handleRecordingComplete = useCallback((blob: Blob, mode: RecordMode) => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl); // now recording complete chunks over i.e. URL done
    setRecordMode(mode);
    setRecordedBlob(blob);
    setRecordedUrl(URL.createObjectURL(blob));
    setSession(null);
  }, [recordedUrl]);

  const handleUpload = useCallback(async () => {
    if (!recordedBlob) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("video", recordedBlob, `recording-${Date.now()}.webm`);
      formData.append("recordingType", mapRecordModeToType(recordMode));
      formData.append("title", `Recording ${new Date().toLocaleString()}`);

      const response = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Upload failed");
      }

      router.push("/dashboard");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload recording."
      );
    } finally {
      setIsUploading(false);
    }
  }, [recordedBlob, recordMode, router]);

  const handleRecordAgain = useCallback(() => { // oldURL removing and blob file null and so on.
    if (recordedUrl) URL.revokeObjectURL(recordedUrl); 
    setRecordedUrl(null);
    setRecordedBlob(null);
    setUploadError(null);
    setSessionKey((current) => current + 1);
  }, [recordedUrl]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <DashboardPageHeader
        title="Record New"
        description="Create and share recordings"
      />

      {recordedUrl ? (
        <div className="space-y-4">
          <p className="text-sm font-medium">Recording Complete</p>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <video
                src={recordedUrl}
                controls
                className="aspect-video w-full bg-black object-contain"
              />
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Recording"}
            </Button>
            <Button
              variant="outline"
              onClick={handleRecordAgain}
              disabled={isUploading}
            >
              Record Again
            </Button>
          </div>
          {uploadError ? (
            <p className="text-sm text-destructive">{uploadError}</p>
          ) : null}
        </div>
      ) : isConnecting ? (
        <p className="text-sm text-muted-foreground">Connecting to LiveKit...</p>
      ) : connectionError ? (
        <div className="space-y-3">
          <p className="text-sm text-destructive">{connectionError}</p>
          <Button variant="outline" onClick={() => setSessionKey((k) => k + 1)}>
            Retry Connection
          </Button>
        </div>
      ) : session ? (
        <LiveKitRoom
          key={session.roomName}
          token={session.token}
          serverUrl={session.serverUrl}
          connect
          audio
          video
          className="contents"
        >
          <RecordingStudio onRecordingComplete={handleRecordingComplete} />
        </LiveKitRoom>
      ) : null}
    </div>
  );
}
