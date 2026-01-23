import { oauth2Client, currentRefreshToken } from "./auth.callback";

export async function loader() {
  if (!currentRefreshToken) {
    return Response.json({ error: "No refresh token available. Please sign in first." }, { status: 400 });
  }

  try {
    // Set the refresh token
    oauth2Client.setCredentials({
      refresh_token: currentRefreshToken
    });

    // Refresh the access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    oauth2Client.setCredentials(credentials);

    return Response.json({ success: true, accessToken: credentials.access_token });
  } catch (error) {
    console.error("Error refreshing token:", error);
    return Response.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}