// ;channels/page.js

"use client";
import useSWR from "swr";
import Link from "next/link";
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ChannelsPage() {
  // Modal state stuff
  const [show, setShow] = useState(false);
  const [channelTitle, setChannelTitle] = useState("");
  const [channelDesc, setChannelDesc] = useState("");
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const createChannel = () => {
    if (!channelTitle || !channelDesc) return;

    fetch("http://localhost:3001/api/channels/newChannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: channelTitle, description: channelDesc }),
    })
      .then((res) => {
        // Check if the status is 201 (Created)
        if (res.status === 201) {
          return res.json();
        }
        // If not 201, throw an error
        throw new Error("Channel creation failed");
      })
      .then((data) => {
        setChannelTitle("");
        setChannelDesc("");
        handleClose();
        //loadPosts();
      })
      .catch((error) => console.error("Error creating channel:", error));
  };

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

  // Hard coded channels for testing
  // const channels = [
  //   {
  //     id: 1,
  //     topic: "General",
  //     description: "General discussions",
  //     timestamp: "2025-03-27 09:00 AM",
  //   },
  //   {
  //     id: 2,
  //     topic: "Random",
  //     description: "Off-topic conversations",
  //     timestamp: "2025-03-27 09:15 AM",
  //   },
  //   {
  //     id: 3,
  //     topic: "Help",
  //     description: "Get support here",
  //     timestamp: "2025-03-27 10:00 AM",
  //   },
  //   {
  //     id: 4,
  //     topic: "Announcements",
  //     description: "Important updates",
  //     timestamp: "2025-03-27 10:30 AM",
  //   },
  //   {
  //     id: 5,
  //     topic: "Feedback",
  //     description: "Share your thoughts",
  //     timestamp: "2025-03-27 11:00 AM",
  //   },
  //   {
  //     id: 6,
  //     topic: "Development",
  //     description: "Code and tech talk",
  //     timestamp: "2025-03-27 11:45 AM",
  //   },
  //   {
  //     id: 7,
  //     topic: "Design",
  //     description: "UI/UX discussions",
  //     timestamp: "2025-03-27 12:30 PM",
  //   },
  //   {
  //     id: 8,
  //     topic: "Marketing",
  //     description: "Promotion strategies",
  //     timestamp: "2025-03-27 01:00 PM",
  //   },
  //   {
  //     id: 9,
  //     topic: "Jobs",
  //     description: "Career opportunities",
  //     timestamp: "2025-03-27 02:00 PM",
  //   },
  //   {
  //     id: 10,
  //     topic: "Fun",
  //     description: "Memes and games",
  //     timestamp: "2025-03-27 03:00 PM",
  //   },
  // ];

  return (
    <div className="text-black flex flex-col justify-center items-center gap-3">
      <h1 className="font-bold text-4xl m-5">Channels</h1>
      <Button
        variant="primary"
        onClick={handleShow}
        className="bg-black font-medium text-white p-2 rounded-md border-white"
      >
        Create New Channel
      </Button>

      <Modal show={show} variant="primary">
        <Modal.Header closeButton onClick={handleClose}>
          <Modal.Title>Create New Channel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Channel Topic</Form.Label>
              <Form.Control
                type="text"
                value={channelTitle}
                onChange={(e) => setChannelTitle(e.target.value)}
                placeholder="Enter topic"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Channel Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={channelDesc}
                onChange={(e) => setChannelDesc(e.target.value)}
                placeholder="Enter description"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={createChannel}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
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
      href={`/channels/${encodeURIComponent(topic)}?channelId=${id}`}
      className="flex flex-col gap-3 min-w-2xl border-gray-500 border-[0.5px] bg-gray-100 text-black shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-decoration-none p-2 transition-all duration-150 hover:border-3 transform-gpu"
    >
      <div>
        <h3 className="text-3xl font-extrabold">{topic}</h3>
        <div className="bg-gray-300 p-[0.3px]"></div>
      </div>
      <p className="flex justify-center">{description}</p>
      <small className="flex justify-end">Created: {time}</small>
    </Link>
  );
}
