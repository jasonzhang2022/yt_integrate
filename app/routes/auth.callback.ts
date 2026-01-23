import { type LoaderFunctionArgs, redirect } from "react-router";
import { google } from "googleapis";

// In-memory OAuth2 client (Demo purpose only)
const REDIRECT_URI = "http://localhost:5173/auth/google/callback";

// In-memory storage for refresh token
export let currentRefreshToken: string | null | undefined = null;

// TODO: Load these from your client_secret.json or environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

export const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/?error=missing_code");
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return redirect("/?error=server_configuration_error");
  }

  try {
    // 1. Exchange Authorization Code for Tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    if (tokens.refresh_token) {
      currentRefreshToken = tokens.refresh_token;
      console.log("Refresh Token retrieved and stored");
    }
    
    console.log("Tokens saved in server memory");

    // 3. Fetch Channel Info using the new Access Token
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const channelResponse = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    const channelData = channelResponse.data;

    let channelName = null;
    if (channelData.items && channelData.items.length > 0) {
      channelName = channelData.items[0].snippet.title;
    }

    if (channelName) {
      return redirect(`/?channel=${encodeURIComponent(channelName)}`);
    }

    return redirect("/");
  } catch (error) {
    console.error("Auth callback error:", error);
    return redirect("/?error=internal_server_error");
  }
}