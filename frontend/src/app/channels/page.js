// Make sure to test if this is actually updating the page (without a refresh) for users when new channels appear

"use client";
import useSWR from "swr";
import Link from "next/link";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ChannelsPage() {
  // const { data: channels, error } = useSWR(
  //   "http://localhost:3001/api/channels",
  //   fetcher,
  //   {
  //     refreshInterval: 3000, // Refresh every 3 seconds
  //     revalidateOnFocus: true, // Optional: Refresh when window regains focus
  //   }
  // );

  // if (error) return <div>Failed to load</div>;
  // if (!channels) return <div>Loading...</div>;

  // Hard coded channels for testing
  const channels = [
    {
      id: 1,
      topic: "General",
      description: "General discussions",
      timestamp: "2025-03-27 09:00 AM",
    },
    {
      id: 2,
      topic: "Random",
      description: "Off-topic conversations",
      timestamp: "2025-03-27 09:15 AM",
    },
    {
      id: 3,
      topic: "Help",
      description: "Get support here",
      timestamp: "2025-03-27 10:00 AM",
    },
    {
      id: 4,
      topic: "Announcements",
      description: "Important updates",
      timestamp: "2025-03-27 10:30 AM",
    },
    {
      id: 5,
      topic: "Feedback",
      description: "Share your thoughts",
      timestamp: "2025-03-27 11:00 AM",
    },
    {
      id: 6,
      topic: "Development",
      description: "Code and tech talk",
      timestamp: "2025-03-27 11:45 AM",
    },
    {
      id: 7,
      topic: "Design",
      description: "UI/UX discussions",
      timestamp: "2025-03-27 12:30 PM",
    },
    {
      id: 8,
      topic: "Marketing",
      description: "Promotion strategies",
      timestamp: "2025-03-27 01:00 PM",
    },
    {
      id: 9,
      topic: "Jobs",
      description: "Career opportunities",
      timestamp: "2025-03-27 02:00 PM",
    },
    {
      id: 10,
      topic: "Fun",
      description: "Memes and games",
      timestamp: "2025-03-27 03:00 PM",
    },
  ];

  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <h1 className="font-bold text-4xl m-5">Channels</h1>
      {channels.map((channel) => (
        <ChannelBox
          key={channel.id}
          id={channel.id}
          topic={channel.topic}
          description={channel.description}
          time={channel.timestamp}
        />
      ))}
    </div>
  );
}

export function ChannelBox({ id, topic, description, time }) {
  return (
    <Link
      href="/channels" // change this later obv
      className="flex flex-col gap-3 min-w-2xl border-2 rounded-2xl p-2 transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu"
    >
      <h3 className="text-2xl font-bold">{topic}</h3>
      <p className="flex justify-center">{description}</p>
      <small className="flex justify-end">Created: {time}</small>
    </Link>
  );
}
