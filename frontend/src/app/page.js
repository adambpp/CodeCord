"use client";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  // Determine the destination based on auth status
  const destination = user ? "/channels" : "/login";
  const buttonText = user ? "View Channels" : "Login";
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <h1 className="font-bold text-6xl">CodeCord</h1>
      <p className="max-w-[225px] text-center">
        Discord/Slack/Stack Overflow type thing but for programming issues only
      </p>
      {loading ? (
        // Show loading state while checking auth
        <button className="bg-gray-400 font-medium text-white p-2 rounded-md cursor-wait">
          Loading...
        </button>
      ) : (
        <Link
          href={destination}
          className="bg-black font-medium text-white p-2 rounded-md hover:bg-gray-600 duration-300 ease-in-out"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}
