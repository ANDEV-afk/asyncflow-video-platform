import { AccessToken } from "livekit-server-sdk";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getLiveKitEnv } from "@/lib/livekit";

export async function POST() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const livekit = getLiveKitEnv();

  if (!livekit) {
    return Response.json(
      {
        error:
          "LiveKit is not configured. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and NEXT_PUBLIC_LIVEKIT_URL.",
      },
      { status: 500 }
    );
  }

  const roomName = `record-${session.user.id}-${Date.now()}`;

  const token = new AccessToken(livekit.apiKey, livekit.apiSecret, {
    identity: session.user.id,
    name: session.user.name,
    ttl: "2h",
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return Response.json({
    token: await token.toJwt(),
    roomName,
    serverUrl: livekit.serverUrl,
  });
}
