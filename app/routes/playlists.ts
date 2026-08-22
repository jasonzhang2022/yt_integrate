import { type LoaderFunctionArgs } from "react-router";
import { google } from "googleapis";
import { oauth2Client } from "./auth.callback";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const cookie = request.headers.get("cookie") || "";
  const useSandbox = cookie.includes("useSandboxApi=true");

  const youtube = google.youtube({ 
    version: "v3", 
    auth: oauth2Client,
    ...(useSandbox && { rootUrl: " https://autopush-youtube.sandbox.googleapis.com" })
  });

  try {
    const response = await youtube.playlists.list(
      {
        part: ["snippet", "contentDetails"],
        mine: true,
        maxResults: 25,
      }
    );

    console.log("Request URL:", response.config.url);
    console.log("Request BaseURL:", response.config.baseURL);
    console.log("Response Status:", response.status);
    console.log("Response Data:",  response.data);


    return response.data;
  } catch (error: any) {
    console.error("Error fetching playlists:", error);
    if (error.config) {
      console.log("Error Request URL:", error.config.url);
      console.log("Error Request BaseURL:", error.config.baseURL);
    }
    if (error.response) {
      console.log("Error Response Status:", error.response.status);
      console.log("Error Response Data:", JSON.stringify(error.response.data, null, 2));
    }
    return Response.json({ error: "Failed to fetch playlists" }, { status: 500 });
  }
}
