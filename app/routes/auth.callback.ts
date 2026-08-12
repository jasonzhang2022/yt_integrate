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

    return new Response(
      "<html><body><script>if (window.opener) { window.opener.postMessage('auth_complete', '*'); } new BroadcastChannel('auth_channel').postMessage('auth_complete'); window.close();</script></body></html>",
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (error) {
    console.error("Auth callback error:", error);
    return redirect("/?error=internal_server_error");
  }
}