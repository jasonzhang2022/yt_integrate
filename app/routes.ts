import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth/google/callback", "routes/auth.callback.ts"),
  route("channel-sections", "routes/channel-sections.ts"),
  route("auth/google/refresh", "routes/refresh-token.ts"),
  route("playlists", "routes/playlists.ts"),
] satisfies RouteConfig;
