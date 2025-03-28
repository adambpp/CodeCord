export default async function ChannelTopicPage({ params }) {
  const channelTopic = params.channelTopic;

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <h1 className="text-4xl font-bold">Channel: {channelTopic}</h1>
      {/* Add more channel-specific content here */}
    </div>
  );
}
