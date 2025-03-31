// /channels/[channelTopic]/message/[messageId]/page.js

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

export default function SingleMessageViewPage({ params }) {
  // Getting the channel topic from the dynamic route with React.use() as params
  // is a promise
  const messageId = decodeURIComponent(use(params).messageId);

  // State variables and handlers
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [replyContents, setReplyContents] = useState("");

  // const { data, error } = useSWR(
  //   `http://localhost:3001/api/posts/${messageId}`,
  //   fetcher,
  //   {
  //     refreshInterval: 3000, // Refresh every 3 seconds
  //     revalidateOnFocus: true, // Optional: Refresh when window regains focus
  //   }
  // );

  const message = {
    _id: "mock-id-1",
    topic: "How to center a div?",
    data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    timestamp: "2025-03-27 09:00 AM",
  };

  const replies = [
    {
      _id: "1",
      type: "reply",
      messageId: "mock-id-1",
      data: "This is a reply",
      timestamp: new Date().toLocaleString("sv-SE"),
    },
    {
      _id: "2",
      type: "reply",
      messageId: "mock-id-1",
      data: "This is also a reply",
      timestamp: new Date().toLocaleString("sv-SE"),
    },
  ];

  return (
    <div className="flex flex-col gap-3 min-w-2xl border-gray-500 border-[0.5px] bg-gray-100 text-black shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-decoration-none p-2">
      <div>
        <h3 className="font-bold">{message.topic}</h3>
        <div className="bg-gray-300 p-[0.3px]"></div>
      </div>
      <p className="p-1.5 m-0">{message.data}</p>
      <small className="flex justify-end">Created: {message.timestamp}</small>
      <div className="bg-gray-300 p-[0.3px]"></div>
      <Button
        variant="primary"
        onClick={handleShow}
        className="bg-black font-medium max-w-[100px] text-white p-2 rounded-md border-white"
      >
        Reply
      </Button>

      <Modal show={show} variant="primary">
        <Modal.Header closeButton onClick={handleClose}>
          <Modal.Title>Create New Reply</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={replyContents}
                onChange={(e) => setReplyContents(e.target.value)}
                placeholder="What would you like to say?"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={console.log("e")}>
            Post
          </Button>
        </Modal.Footer>
      </Modal>
      {replies.map((reply) => (
        <ReplyBox
          key={reply._id}
          data={reply.data}
          timestamp={reply.timestamp}
        />
      ))}
    </div>
  );
}

export function ReplyBox({ data, timestamp }) {
  return (
    <div className="flex flex-col">
      <p className="m-0">User</p>
      <p className="m-0 pl-1">{data}</p>
    </div>
  );
}
