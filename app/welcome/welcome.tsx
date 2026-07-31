import { useState, useEffect } from "react";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome({ channels, clientId }: { channels?: any[] | null; clientId?: string }) {
  const [channel, setChannel] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<any>(null);
  const [useProdEndpoint, setUseProdEndpoint] = useState(true);
  const [enableYtPermissions, setEnableYtPermissions] = useState(false);



  useEffect(() => {
    // Check for error in URL query params
    const searchParams = new URLSearchParams(window.location.search);
    const error = searchParams.get("error");

    if (error) {
      console.error("Auth error:", error);
      window.history.replaceState(null, "", window.location.pathname);
    }

    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data === "auth_complete") {
        window.location.reload();
      }
    };
    window.addEventListener("message", handleAuthMessage);
    return () => window.removeEventListener("message", handleAuthMessage);
  }, []);

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <div className="max-w-4xl w-full space-y-6 px-4 actions">
          <div className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
            <p className="leading-6 text-gray-700 dark:text-gray-200 text-center font-semibold">
              YouTube Channel Selection
            </p>
            <div className="flex flex-col items-center gap-4">
              {channels && channels.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Channel Name</th>
                        <th scope="col" className="px-6 py-3">Channel ID</th>
                        <th scope="col" className="px-6 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channels.map((c: any) => (
                        <tr key={c.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {c.snippet.title}
                          </td>
                          <td className="px-6 py-4">
                            {c.id}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setChannel(c.snippet.title);
                                fetch(`/playlists?channelId=${c.id}`)
                                  .then((res) => res.json())
                                  .then((data) => setPlaylists(data))
                                  .catch((err) => console.error(err));
                              }}
                              className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                            >
                              Show Playlists
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No channel selected</p>
              )}
              <div className="flex flex-col gap-2 w-full max-w-md my-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useProdEndpoint}
                    onChange={(e) => setUseProdEndpoint(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Use Prod Endpoint (uncheck for Autopush)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableYtPermissions}
                    onChange={(e) => setEnableYtPermissions(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Channel Picker
                </label>
              </div>
              <div className="flex w-full gap-2 justify-center">
                <button
                  onClick={() => {
                    const redirectUri = "http://localhost:5173/auth/google/callback";
                    const scope = "https://www.googleapis.com/auth/youtube.readonly";
                    const baseUrl = useProdEndpoint ? "https://accounts.google.com/o/oauth2/v2/auth" : "https://accounts.sandbox.google.com/o/oauth2/v2/auth";
                    let authUrl = `${baseUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&include_granted_scopes=true&state=state_parameter_passthrough_value&access_type=offline&prompt=consent`;
                    if (enableYtPermissions) authUrl += "&enable_yt_permissions=true";
                    console.log("Final Auth URL:", authUrl);
                    const width = 600;
                    const height = 700;
                    const left = window.screen.width / 2 - width / 2;
                    const top = window.screen.height / 2 - height / 2;
                    window.open(authUrl, "Google Auth", `width=${width},height=${height},top=${top},left=${left}`);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  {channels && channels.length > 0 ? "Change Channel" : "Select Channel"}
                </button>
                <button
                  onClick={() => {
                    fetch("/auth/google/refresh")
                      .then((res) => res.json())
                      .then((data) => {
                        if (data.error) alert(data.error);
                        else alert("Access token refreshed successfully!");
                      })
                      .catch((err) => console.error(err));
                  }}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  New Access Token
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="playlists">
          {playlists && (
            <div className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4 overflow-auto max-h-[400px] w-full max-w-[800px]">
              <p className="leading-6 text-gray-700 dark:text-gray-200 font-semibold">Playlists for {channel}</p>
              {playlists.items && playlists.items.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Playlist ID</th>
                        <th scope="col" className="px-6 py-3">Title</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playlists.items.map((playlist: any) => (
                        <tr key={playlist.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {playlist.id}
                          </td>
                          <td className="px-6 py-4">
                            {playlist.snippet?.title}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No playlists found</p>
              )}
            </div>
          )}
        </div>
      </div>
      
    </main>
  );
}
