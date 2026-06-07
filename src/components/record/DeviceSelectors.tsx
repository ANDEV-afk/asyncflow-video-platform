"use client";

import { Label } from "@/components/ui/label";

type DeviceSelectorsProps = {
  microphones: MediaDeviceInfo[]; // media device popup for allow/disable at user side.
  cameras: MediaDeviceInfo[];
  selectedMic: string;
  selectedCamera: string;
  onMicChange: (deviceId: string) => void; // if multiple mics.
  onCameraChange: (deviceId: string) => void;
  disabled?: boolean; // if user does not allow initially so for handling that case.
  showCamera?: boolean;
};

export default function DeviceSelectors({
  microphones,
  cameras,
  selectedMic,
  selectedCamera,
  onMicChange,
  onCameraChange,
  disabled = false,
  showCamera = true,
}: DeviceSelectorsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="microphone">Microphone</Label>
        <select
          id="microphone"
          value={selectedMic}
          onChange={(event) => onMicChange(event.target.value)} // js object event prop,mic change another one.
          disabled={disabled}
          className="h-10 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50"
        >
          {microphones.length === 0 ? (
            <option value="default">Default</option>
          ) : (
            microphones.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || "Default Microphone"}
              </option>
            ))
          )}
        </select>
      </div>

      {showCamera && (
        <div className="grid gap-2">
          <Label htmlFor="camera">Camera</Label>
          <select
            id="camera"
            value={selectedCamera}
            onChange={(event) => onCameraChange(event.target.value)}
            disabled={disabled}
            className="h-10 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50"
          >
            {cameras.length === 0 ? (
              <option value="default">Default</option>
            ) : (
              cameras.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || "Default Camera"}
                </option>
              ))
            )}
          </select>
        </div>
      )}
    </div>
  );
}
