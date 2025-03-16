import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <h1 className="font-bold text-6xl">CodeCord</h1>
      <p className="max-w-[225px] text-center">
        Discord/Slack/Stack Overflow type thing but for programming issues only
      </p>
      <Link
        href="/channels"
        className="bg-white font-medium text-black p-2 rounded-md hover:bg-gray-400 duration-300 ease-in-out"
      >
        View Channels
      </Link>
    </div>
  );
}
