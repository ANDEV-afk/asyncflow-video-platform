"use client";

import { Track } from "livekit-client";
import { isTrackReference } from "@livekit/components-core";
import { VideoTrack, useTracks } from "@livekit/components-react";
import { Card, CardContent } from "@/components/ui/card";
import type { RecordMode } from "@/components/record/types";

type RecordingPreviewProps = {
  isRecording: boolean;
  recordMode: RecordMode;
};

export default function RecordingPreview({
  isRecording,
  recordMode,
}: RecordingPreviewProps) {
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const screenTracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: true },
  ]);

  const cameraTrack = isTrackReference(cameraTracks[0]) ? cameraTracks[0] : null;
  const screenTrack = isTrackReference(screenTracks[0]) ? screenTracks[0] : null;

  const showCamera =
    recordMode === "camera-only" || recordMode === "screen-camera";
  const showScreen =
    recordMode === "screen-only" || recordMode === "screen-camera";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-video w-full bg-muted">
          {showScreen && screenTrack ? (
            <VideoTrack
              trackRef={screenTrack}
              className="h-full w-full object-contain"
            />
          ) : showCamera && cameraTrack ? (
            <VideoTrack
              trackRef={cameraTrack}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm font-medium">Camera Preview</p>
              <p className="text-sm text-muted-foreground">
                {showCamera
                  ? "Connecting camera..."
                  : "Screen share starts when you record"}
              </p>
            </div>
          )}

          {showScreen && showCamera && cameraTrack && screenTrack && (
            <div className="absolute right-4 bottom-4 h-28 w-44 overflow-hidden rounded-xl border-2 border-background shadow-lg">
              <VideoTrack
                trackRef={cameraTrack}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-destructive px-3 py-1 text-xs font-medium text-white">
              <span className="size-2 animate-pulse rounded-full bg-white" />
              Recording
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
