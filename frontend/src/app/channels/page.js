// Make sure to test if this is actually updating the page (without a refresh) for users when new channels appear

"use client";
import useSWR from "swr";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ChannelsPage() {
  const { data: channels, error } = useSWR(
    "http://localhost:3001/api/channels",
    fetcher,
    {
      refreshInterval: 3000, // Refresh every 3 seconds
      revalidateOnFocus: true, // Optional: Refresh when window regains focus
    }
  );

  if (error) return <div>Failed to load</div>;
  if (!channels) return <div>Loading...</div>;

  return (
    <div>
      <h1>Channels</h1>
      {channels.map((channel) => (
        <div key={channel.id}>{channel.topic}</div>
      ))}
    </div>
  );
}
