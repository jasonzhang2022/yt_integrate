import { useState, useEffect } from "react";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome({ clientId }: { clientId?: string }) {
  const [channel, setChannel] = useState<string | null>(null);
  const [channelSections, setChannelSections] = useState<any>(null);

  useEffect(() => {
    // Check for channel info in URL query params (returned from our server callback)
    const searchParams = new URLSearchParams(window.location.search);
    const channelName = searchParams.get("channel");
    const error = searchParams.get("error");

    if (channelName) {
      setChannel(channelName);
      window.history.replaceState(null, "", window.location.pathname);
    } else if (error) {
      console.error("Auth error:", error);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <div className="max-w-[300px] w-full space-y-6 px-4 actions">
          <div className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
            <p className="leading-6 text-gray-700 dark:text-gray-200 text-center font-semibold">
              YouTube Channel Selection
            </p>
            <div className="flex flex-col items-center gap-4">
              {channel ? (
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Channel</p>
                  <button
                    className="text-lg font-medium text-gray-900 dark:text-white cursor-pointer hover:underline hover:text-blue-600"
                    onClick={() => {
                      fetch("/channel-sections")
                        .then((res) => res.json())
                        .then((data) => setChannelSections(data))
                        .catch((err) => console.error(err));
                    }}
                  >
                    {channel}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No channel selected</p>
              )}
              <div className="flex w-full gap-2">
                <button
                  onClick={() => {
                    const redirectUri = "http://localhost:5173/auth/google/callback";
                    const scope = "https://www.googleapis.com/auth/youtube.readonly";
                    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&include_granted_scopes=true&state=state_parameter_passthrough_value&access_type=offline&prompt=consent`;
                    window.location.href = authUrl;
                  }}
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  {channel ? "Change Channel" : "Select Channel"}
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
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  New Access Token
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="channelsections">
          {channelSections && (
            <div className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4 overflow-auto max-h-[400px] w-full max-w-[800px]">
              <p className="leading-6 text-gray-700 dark:text-gray-200 font-semibold">Channel Sections</p>
              <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(channelSections, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
    </main>
  );
}
