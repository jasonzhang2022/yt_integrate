import { google } from "googleapis";
import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { oauth2Client } from "./auth.callback";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  let channels = null;

  if (oauth2Client.credentials && oauth2Client.credentials.access_token) {
    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    try {
      const response = await youtube.channels.list({
        part: ["snippet", "id"],
        mine: true,
      });
      channels = response.data.items;
    } catch (error) {
      console.error("Error fetching channels:", error);
    }
  }

  return { channels, clientId: process.env.CLIENT_ID };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome channels={loaderData.channels} clientId={loaderData.clientId} />;
}
