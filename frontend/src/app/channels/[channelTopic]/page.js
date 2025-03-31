// /channels/[channelTopic]/page.js

"use client";
import { use } from "react";
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import useSWR from "swr";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function ChannelTopicPage({ params }) {
  // Getting the channel topic from the dynamic route with React.use() as params
  // is a promise
  const channelTopic = decodeURIComponent(use(params).channelTopic);

  // Get the channelId from query parameters
  const searchParams = useSearchParams();
  const channelId = searchParams.get("channelId");

  // State variables and handlers
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContents, setMessageContents] = useState("");

  const createMessage = () => {
    if (!messageTitle || !messageContents) return;

    fetch("http://localhost:3001/api/posts/newMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: messageTitle,
        data: messageContents,
        channelId: channelId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessageTitle("");
          setMessageContents("");
          handleClose();
        }
      })
      .catch((error) => console.error("Error creating post:", error));
  };

  // const { data, error } = useSWR("http://localhost:3001/api/posts", fetcher, {
  //   refreshInterval: 3000, // Refresh every 3 seconds
  //   revalidateOnFocus: true, // Optional: Refresh when window regains focus
  // });

  // if (error) return <div>Failed to load</div>;
  // if (!data) return <div>Loading...</div>;

  // // Only get the messages that have the matching channelId
  // const channelMessages = data.messages.filter(
  //   (message) => message.channelId === channelId
  // );

  // Group replies by messageId (Don't think I need this here, will put in another script)
  // const messageReplies = data.replies.reduce((acc, reply) => {
  //   if (!acc[reply.messageId]) {
  //     acc[reply.messageId] = [];
  //   }
  //   acc[reply.messageId].push(reply);
  //   return acc;
  // }, {});

  const channelMessages = [
    {
      _id: "mock-id-1",
      topic: "How to center a div?",
      data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      timestamp: "2025-03-27 09:00 AM",
    },

    {
      _id: "mock-id-2",
      topic: "How to return multiple values in C",
      data: "How do I do this? I feel like you can use pointers to achieve this, but I am not 100% sure.",
      timestamp: "2025-03-27 09:00 AM",
    },
  ];

  return (
    <div className="text-black flex flex-col justify-center items-center gap-3">
      <h1 className="text-4xl font-bold">Channel: {channelTopic}</h1>
      <Button
        variant="primary"
        onClick={handleShow}
        className="bg-black font-medium text-white p-2 rounded-md border-white"
      >
        Create New Message
      </Button>

      <Modal show={show} variant="primary">
        <Modal.Header closeButton onClick={handleClose}>
          <Modal.Title>Create New Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Message Topic</Form.Label>
              <Form.Control
                type="text"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="Enter topic"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message Contents</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={messageContents}
                onChange={(e) => setMessageContents(e.target.value)}
                placeholder="Enter message content"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={createMessage}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
      {channelMessages.map((message) => (
        <MessageBox
          key={message._id}
          id={message._id}
          topic={message.topic}
          data={message.data}
          timestamp={message.timestamp}
          channelTopic={channelTopic}
          channelId={channelId}
        />
      ))}
    </div>
  );
}

export function MessageBox({ id, topic, data, timestamp, channelTopic }) {
  return (
    <div className="flex flex-col gap-3 min-w-2xl border-gray-500 border-[0.5px] bg-gray-100 text-black shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-decoration-none p-2">
      <div>
        <h3 className="font-bold">{topic}</h3>
        <div className="bg-gray-300 p-[0.3px]"></div>
      </div>
      <p className="p-1.5 m-0">{data}</p>
      <div className="bg-gray-300 p-[0.3px]"></div>
      <div className="flex justify-between">
        <Link
          href={`/channels/${encodeURIComponent(
            channelTopic
          )}/message/${encodeURIComponent(id)}`}
          className="flex justify-center items-center gap-1.5 p-1.5 rounded-[5px] bg-white text-black text-decoration-none transition-all duration-300 hover:scale-105 transform-gpu"
        >
          <FontAwesomeIcon icon={faComment} />
          <p className="m-0">View Replies</p>
        </Link>
        <small className="flex items-center">{timestamp}</small>
      </div>
    </div>
  );
}
