"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Track, type LocalParticipant } from "livekit-client";
import {
  RoomAudioRenderer,
  useLocalParticipant,
  useMediaDeviceSelect,
  useRoomContext,
} from "@livekit/components-react";
import RecordingPreview from "@/components/record/RecordingPreview";
import RecordingOptions from "@/components/record/RecordingOptions";
import DeviceSelectors from "@/components/record/DeviceSelectors";
import StartRecordingButton from "@/components/record/StartRecordingButton";
import { Separator } from "@/components/ui/separator";
import type { RecordMode } from "@/components/record/types";

type RecordingStudioProps = {
  onRecordingComplete: (blob: Blob, mode: RecordMode) => void;
};

async function waitForTrack(
  participant: LocalParticipant,
  source: Track.Source,
  timeoutMs = 8000
) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const publication = participant.getTrackPublication(source); // if timeout not occur, get the particular track.
    if (publication?.track?.mediaStreamTrack) {
      return publication.track.mediaStreamTrack;
    }
    await new Promise((resolve) => setTimeout(resolve, 150)); // if resolve then again poll the track
  }

  throw new Error(`Timed out waiting for ${source} track.`);
}

async function buildCompositeStream(
  screenTrack: MediaStreamTrack, // built-in interface that represents single media track.
  cameraTrack: MediaStreamTrack
) {
  const screenVideo = document.createElement("video");
  screenVideo.srcObject = new MediaStream([screenTrack]); // attaching particular stream to that video element
  screenVideo.muted = true; // by default on screen share mic is muted, change it. 
  await screenVideo.play(); //play the screen video interface on UI.

  const cameraVideo = document.createElement("video");
  cameraVideo.srcObject = new MediaStream([cameraTrack]);
  cameraVideo.muted = true;
  await cameraVideo.play();

  const settings = screenTrack.getSettings(); // settings for the track.
  const canvas = document.createElement("canvas"); // blank canvas in the dom model.
  canvas.width = settings.width ?? 1280; // screen share media track ki settings hai.
  canvas.height = settings.height ?? 720; // canvas mein settings set kar rhe screenTrack ki for composite video.

  const ctx = canvas.getContext("2d"); // screen size size context 2d here.
  if (!ctx) throw new Error("Canvas is not supported."); // so if canvas not supported screen share would not work.

  const pipWidth = Math.floor(canvas.width * 0.25); // pip-> picture in picture
  const pipHeight = Math.floor((pipWidth * 9) / 16);

  let frameId = 0;
  const draw = () => {
    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height); // every frame draw on canvas that captured while recording.
    ctx.drawImage( // first screen draw now camera draw
      cameraVideo,
      canvas.width - pipWidth - 24,
      canvas.height - pipHeight - 24,
      pipWidth,
      pipHeight
    );
    frameId = requestAnimationFrame(draw); // for drawing frame on canvas but as video moves draw() should be called to capture other moves.
  };

  draw(); // so now every frame is captured like this.

  const stream = canvas.captureStream(30); // video stream
  const stop = () => {
    cancelAnimationFrame(frameId); // animation loop break for preventing memory leak.
    screenVideo.srcObject = null; // after canvas work done.
    cameraVideo.srcObject = null;
  };

  return { stream, stop }; // when recording stopped, returning stream and stop function.
}

export default function RecordingStudio({
  onRecordingComplete,
}: RecordingStudioProps) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const micSelect = useMediaDeviceSelect({ kind: "audioinput", room });
  const cameraSelect = useMediaDeviceSelect({ kind: "videoinput", room });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null); // initially woh mediaRecorder box exmpty. 
  const chunksRef = useRef<Blob[]>([]);
  const compositeStopRef = useRef<(() => void) | null>(null);

  const [recordMode, setRecordMode] = useState<RecordMode>("screen-camera");
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showCamera =
    recordMode === "camera-only" || recordMode === "screen-camera";
  const controlsDisabled = isRecording || isPreparing;

  const syncPreviewTracks = useCallback(async () => {
    if (isRecording) return;

    try {
      await localParticipant.setMicrophoneEnabled(true);

      if (recordMode === "camera-only") {
        await localParticipant.setCameraEnabled(true);
        await localParticipant.setScreenShareEnabled(false);
      } else if (recordMode === "screen-only") {
        await localParticipant.setCameraEnabled(false);
        await localParticipant.setScreenShareEnabled(false);
      } else {
        await localParticipant.setCameraEnabled(true);
        await localParticipant.setScreenShareEnabled(false);
      }

      setError(null);
    } catch {
      setError("Unable to access camera or microphone.");
    }
  }, [isRecording, localParticipant, recordMode]);

  useEffect(() => { // page load hoti hi run hoga
    syncPreviewTracks();
  }, [syncPreviewTracks]);

  const handleStartRecording = useCallback(async () => {
    if (isRecording || isPreparing) return;

    setIsPreparing(true);
    setError(null);
    chunksRef.current = []; // old video remove, no chunks here of any video as new video coming.

    try {
      if (recordMode !== "camera-only") {
        await localParticipant.setScreenShareEnabled(true, { audio: true });
      }

      const audioTrack = await waitForTrack(
        localParticipant,
        Track.Source.Microphone // polling for mic track enabled.
      );

      let recordingStream: MediaStream; // recording stream of MediaStream interface of JS.

      if (recordMode === "camera-only") {
        const cameraTrack = await waitForTrack( // check tracks came from LiveKit or not.
          localParticipant,
          Track.Source.Camera
        );
        recordingStream = new MediaStream([cameraTrack, audioTrack]); // browser api for media handling
      } else if (recordMode === "screen-only") {
        const screenTrack = await waitForTrack(
          localParticipant,
          Track.Source.ScreenShare
        );
        recordingStream = new MediaStream([screenTrack, audioTrack]);
      } else {
        const screenTrack = await waitForTrack(
          localParticipant,
          Track.Source.ScreenShare
        );
        const cameraTrack = await waitForTrack(
          localParticipant,
          Track.Source.Camera
        );
        const composite = await buildCompositeStream(screenTrack, cameraTrack);
        compositeStopRef.current = composite.stop; // this function is saved in the ref object, for latter use of stop().
        recordingStream = new MediaStream([
          ...composite.stream.getVideoTracks(), // composite track se video track combined(screen+camera) capture
          audioTrack,
        ]);
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"// video file type check in browser
        : "video/webm";

      const recorder = new MediaRecorder(recordingStream, { mimeType }); // a MediaRecorder that watches that stream and saves it.
      // Stream leta hai
      // Encode karta hai
      // Chunks generate karta hai

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      // ondataavailable runs whenever the recorder has a new piece of data.
      // event.data — one chunk (a slice of the video file)
      // chunksRef.current — an array that stores all chunks
      // if (event.data.size > 0) — ignore empty chunks

      recorder.onstop = () => {
        compositeStopRef.current?.(); //Stops the canvas animation (Screen + Camera mode only), calling stop().
        compositeStopRef.current = null;//Clears that cleanup function
        const blob = new Blob(chunksRef.current, { type: mimeType });//Combines all chunks into one video file in memory
        onRecordingComplete(blob, recordMode);//Sends the finished video to the parent (LiveKitRecorder) for preview/upload

        setIsRecording(false);//UI: hide “Recording” state
        setIsPreparing(false);//UI: not “Preparing…” anymore
      };

      mediaRecorderRef.current = recorder;//Saves recorder so Stop can call .stop() later
      recorder.start(1000);//Starts recording; 1000 = emit a chunk every 1 second (ms)
      setIsRecording(true);//UI shows “Recording” badge
    } catch (recordingError) {
      compositeStopRef.current?.(); // STOP() FUNCTION CALLED.
      compositeStopRef.current = null; // ref object null, no canvas video for now.
      await localParticipant.setScreenShareEnabled(false); // set state.
      setIsRecording(false);
      setIsPreparing(false);
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : "Failed to start recording."
      );
    } finally {
      setIsPreparing(false);
    }
  }, [
    isPreparing,
    isRecording,
    localParticipant,
    onRecordingComplete,
    recordMode,
  ]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop(); // if recording is done at this point then stop mediaRecorder by calling stop().
    }
    localParticipant.setScreenShareEnabled(false).catch(() => undefined);
  }, [localParticipant]);

  return (
    <div className="space-y-8">
      <RoomAudioRenderer />

      <RecordingPreview isRecording={isRecording} recordMode={recordMode} />

      <RecordingOptions
        recordMode={recordMode}
        setRecordMode={setRecordMode}
        disabled={controlsDisabled}
      />

      <Separator />

      <DeviceSelectors
        microphones={micSelect.devices}
        cameras={cameraSelect.devices}
        selectedMic={micSelect.activeDeviceId ?? "default"}
        selectedCamera={cameraSelect.activeDeviceId ?? "default"}
        onMicChange={(deviceId) => micSelect.setActiveMediaDevice(deviceId)}
        onCameraChange={(deviceId) => cameraSelect.setActiveMediaDevice(deviceId)}
        disabled={controlsDisabled}
        showCamera={showCamera}
      />

      <Separator />

      <StartRecordingButton
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        isRecording={isRecording}
        disabled={isPreparing}
        label={
          isPreparing
            ? "Preparing..."
            : isRecording
              ? "Stop Recording"
              : "Start Recording"
        }
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
