// /channels/[channelTopic]/page.js

"use client";
import { use } from "react";
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import useSWR from "swr";
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

  const { data, error } = useSWR("http://localhost:3001/api/posts", fetcher, {
    refreshInterval: 3000, // Refresh every 3 seconds
    revalidateOnFocus: true, // Optional: Refresh when window regains focus
  });

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  // Only get the messages that have the matching channelId
  const channelMessages = data.messages.filter(
    (message) => message.channelId === channelId
  );

  // Group replies by messageId
  const messageReplies = data.replies.reduce((acc, reply) => {
    if (!acc[reply.messageId]) {
      acc[reply.messageId] = [];
    }
    acc[reply.messageId].push(reply);
    return acc;
  }, {});

  // const messages = [
  //   {
  //     id: "mock-id-1",
  //     topic: "How to center a div?",
  //     data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  //     timestamp: "2025-03-27 09:00 AM",
  //   },

  //   {
  //     id: "mock-id-2",
  //     topic: "How to return multiple values in C",
  //     data: "How do I do this? I feel like you can use pointers to achieve this, but I am not 100% sure.",
  //     timestamp: "2025-03-27 09:00 AM",
  //   },
  // ];

  return (
    <div className="bg-black text-white flex flex-col justify-center items-center gap-3">
      <h1 className="text-4xl font-bold">Channel: {channelTopic}</h1>
      <Button
        variant="primary"
        onClick={handleShow}
        className="bg-white font-medium text-black p-2 rounded-md border-white"
      >
        Create New Channel
      </Button>

      <Modal show={show} variant="primary">
        <Modal.Header closeButton onClick={handleClose}>
          <Modal.Title>Create New Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Channel Topic</Form.Label>
              <Form.Control
                type="text"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                placeholder="Enter topic"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Channel Description</Form.Label>
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
          topic={message.topic}
          data={message.data}
          timestamp={message.timestamp}
        />
      ))}
    </div>
  );
}

export function MessageBox({ topic, data, timestamp }) {
  return (
    <div className="flex flex-col gap-3 border-2 border-white text-white text-decoration-none rounded-[4px] p-2">
      <h3 className="font-bold text-center">{topic}</h3>
      <p className="p-1.5">{data}</p>
      <div className="flex justify-between">
        <div className="flex justify-center items-center gap-1">
          <FontAwesomeIcon icon={faComment} />
          <p className="m-0">63</p>
        </div>
        <small>{timestamp}</small>
      </div>
    </div>
  );
}
