import { type LoaderFunctionArgs } from "react-router";
import { google } from "googleapis";
import { oauth2Client } from "./auth.callback";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const channelId = url.searchParams.get("channelId");

  if (!channelId) {
    return Response.json({ error: "Missing channelId" }, { status: 400 });
  }

  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  try {
    const response = await youtube.playlists.list({
      part: ["snippet", "contentDetails"],
      channelId: channelId,
      maxResults: 25,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return Response.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}
