import {
  API_KEY,
  API_URL,
  AVATAR_ID,
  VOICE_ID,
  CONTEXT_ID,
  LANGUAGE,
} from "../secrets";

export async function POST(request: Request) {
  let session_token = "";
  let session_id = "";
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      // No body provided, use defaults
    }

    const customAvatarId = (body as { avatar_id?: string })?.avatar_id;
    const customVoiceId = (body as { voice_id?: string })?.voice_id;
    const customContextId = (body as { context_id?: string })?.context_id;
    const avatarIdToUse = customAvatarId || AVATAR_ID;
    const voiceIdToUse = customVoiceId || VOICE_ID;
    const contextIdToUse = customContextId || CONTEXT_ID;

    const res = await fetch(`${API_URL}/v1/sessions/token`, {
      method: "POST",
      headers: {
        "X-API-KEY": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: avatarIdToUse,
        avatar_persona: {
          voice_id: voiceIdToUse,
          context_id: contextIdToUse,
          language: LANGUAGE,
        },
      }),
    });
    if (!res.ok) {
      const resp = await res.json();
      const errorMessage =
        resp.data[0].message ?? "Failed to retrieve session token";
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: res.status,
      });
    }
    const data = await res.json();

    session_token = data.data.session_token;
    session_id = data.data.session_id;
  } catch (error) {
    console.error("Error retrieving session token:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
    });
  }

  if (!session_token) {
    return new Response("Failed to retrieve session token", {
      status: 500,
    });
  }
  return new Response(JSON.stringify({ session_token, session_id }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
