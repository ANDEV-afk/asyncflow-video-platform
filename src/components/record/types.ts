export type RecordMode = "screen-camera" | "screen-only" | "camera-only";

export function mapRecordModeToType(mode: RecordMode) {
  if (mode === "screen-only") return "SCREEN";
  if (mode === "camera-only") return "CAMERA";
  return "SCREEN_AND_CAMERA";
}
