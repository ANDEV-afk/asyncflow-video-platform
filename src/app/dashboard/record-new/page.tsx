"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function RecordNewPage() {
  const router = useRouter();
  const [session, setSession] = useState<LiveKitSession | null>(null);
  const [sessionKey, setSessionKey] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [recordedUrl, setRecordedUrl] = useState<string | null>(null); // initially no recording on comp mount.
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null); // same for blob
  const [recordMode, setRecordMode] = useState<RecordMode>("screen-camera");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");

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

  useEffect(() => { // if livekit session changes then useEffect for checking unauthorized request.
    createSession();
  }, [createSession, sessionKey]);

  const handleRecordingComplete = useCallback( // useCallback as not render unnecessary as by default options can be there.
    (blob: Blob, mode: RecordMode) => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl); // initially no url so revoking also removing old file ref.
      setRecordMode(mode);
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob)); // recording done, create Url using blob.
      setSession(null); // recording done so Livekit session work complete so null set here.
    },
    [recordedUrl]
  );

  const handleUpload = useCallback(async () => {
    if (!recordedBlob) return;

    if (!videoTitle.trim()) {
      setUploadError("Title is required");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("video", recordedBlob, `recording-${Date.now()}.webm`);
      formData.append("recordingType", mapRecordModeToType(recordMode));
      formData.append("title", videoTitle);
      formData.append("description", videoDescription);
      formData.append("visibility", visibility);

      const response = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Upload failed");
      }

      setShowUploadDialog(false);
      router.push("/dashboard/my-videos");
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload recording."
      );
    } finally {
      setIsUploading(false);
    }
  }, [
    recordedBlob,
    recordMode,
    videoTitle,
    videoDescription,
    visibility,
    router,
  ]);

  const handleRecordAgain = useCallback(() => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setRecordedBlob(null);
    setUploadError(null);
    setShowUploadDialog(false);
    setVideoTitle("");
    setVideoDescription("");
    setVisibility("PRIVATE");
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
            <Button
              onClick={() => {
                setUploadError(null);
                setVideoTitle(`Recording ${new Date().toLocaleString()}`);
                setShowUploadDialog(true);
              }}
              disabled={isUploading}
            >
              Upload Recording
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
        <LiveKitRoom // for session creation get the props, IF YES session occurs.
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

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Recording</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Video Title"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
            />

            <Textarea
              placeholder="Description"
              value={videoDescription}
              onChange={(e) => setVideoDescription(e.target.value)}
            />

            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRIVATE">Private</SelectItem>
                <SelectItem value="UNLISTED">Unlisted</SelectItem>
                <SelectItem value="PUBLIC">Public</SelectItem>
              </SelectContent>
            </Select>

            {uploadError ? (
              <p className="text-sm text-destructive">{uploadError}</p>
            ) : null}

            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Video"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
