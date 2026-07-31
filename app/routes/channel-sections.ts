import { type LoaderFunctionArgs } from "react-router";
import { google } from "googleapis";
import { oauth2Client } from "./auth.callback";

export async function loader({ request }: LoaderFunctionArgs) {
  // Check if we have credentials (access token)
  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    return Response.json({ error: "No access token available" }, { status: 401 });
  }

  const cookie = request.headers.get("cookie") || "";
  const useSandbox = cookie.includes("useSandboxApi=true");

  const youtube = google.youtube({ 
    version: "v3", 
    auth: oauth2Client,
    ...(useSandbox && { rootUrl: " https://autopush-youtube.sandbox.googleapis.com" })
  });

  try {
    const response = await youtube.channelSections.list(
      {
        part: ["snippet", "contentDetails"],
        mine: true,
      },
      {
        headers: { "x-yt-jz-test": "1" },
      }
    );
    console.log("Response Data:", response.data);
    return Response.json(response.data);
  } catch (error) {
    console.error("YouTube API Error:", error);
    return Response.json({ error: "Failed to fetch channel sections" }, { status: 500 });
  }
}