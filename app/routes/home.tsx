import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader() {
  return { clientId: process.env.CLIENT_ID };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome clientId={loaderData.clientId} />;
}
