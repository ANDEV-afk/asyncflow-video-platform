export type Visibility = "PRIVATE" | "PUBLIC" | "UNLISTED";

export const VISIBILITY = {
  PRIVATE: "PRIVATE",
  PUBLIC: "PUBLIC",
  UNLISTED: "UNLISTED",
} as const satisfies Record<string, Visibility>;

export type Video = {
  id: string;
  title: string;
  description: string | null;
  visibility: Visibility;
  workspaceId: string | null;
  shareId: string;
  viewCount: number;
  createdAt: Date;
  duration: number | null;
  recordingType: string | null;
};

export function getWorkspaceIdForVideo(
  visibility: Visibility,
  selectedWorkspace: string
): string | null {
  if (visibility === VISIBILITY.PRIVATE) {
    return null;
  }

  if (
    selectedWorkspace === "personal" ||
    !selectedWorkspace
  ) {
    return null;
  }

  return selectedWorkspace;
}
