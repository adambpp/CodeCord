// /channels/[channelTopic]/message/[messageId]/page.js

"use client";
import { use } from "react";
import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import useSWR from "swr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import { useAuth } from "../../../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const fetcher = (url) => {
  const { authFetch } = useAuth();
  return authFetch(url).then((res) => res.json());
};

export default function SingleMessageViewPage({ params }) {
  // Getting the channel topic from the dynamic route with React.use() as params
  // is a promise
  const messageId = decodeURIComponent(use(params).messageId);

  const { authFetch, user } = useAuth(); // Get authFetch from context
  // Use authFetch inside a custom fetcher function for SWR
  const fetcher = (url) => authFetch(url).then((res) => res.json());

  // State variables and handlers
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [replyContents, setReplyContents] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const createReply = () => {
    if (!replyContents) return;

    authFetch("http://localhost:3001/api/posts/newReply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messageId: messageId,
        data: replyContents,
        user: user.username,
        imageUrl: imageUrl,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReplyContents("");
          setImageUrl("");
          handleClose();
        }
      })
      .catch((error) => console.error("Error creating reply:", error));
  };

  const { data, error } = useSWR(
    `http://localhost:3001/api/posts/${messageId}`,
    fetcher,
    {
      refreshInterval: 3000, // Refresh every 3 seconds
      revalidateOnFocus: true, // Optional: Refresh when window regains focus
    }
  );

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const message = data.message;
  const replies = data.replies;

  // const message = {
  //   _id: "mock-id-1",
  //   topic: "How to center a div?",
  //   data: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  //   timestamp: "2025-03-27 09:00 AM",
  // };

  // const replies = [
  //   {
  //     _id: "1",
  //     type: "reply",
  //     messageId: "mock-id-1",
  //     data: "This is a reply",
  //     timestamp: new Date().toLocaleString("sv-SE"),
  //   },
  //   {
  //     _id: "2",
  //     type: "reply",
  //     messageId: "mock-id-1",
  //     data: "This is also a reply",
  //     timestamp: new Date().toLocaleString("sv-SE"),
  //   },
  // ];

  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-3 min-w-2xl border-gray-500 border-[0.5px] bg-gray-100 text-black shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-decoration-none p-2">
        <div>
          <p>
            Posted by: <strong>{message.user}</strong>
          </p>
          <h3 className="font-bold">{message.topic}</h3>
          <div className="bg-gray-300 p-[0.3px]"></div>
        </div>
        <p className="p-1.5 m-0">{message.data}</p>
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Message related"
            className="max-w-full h-auto my-2"
          />
        )}
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
              <Form.Group className="mb-3">
                <Form.Label>Add Image to Reply (optional)</Form.Label>
                <Form.Control
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={createReply}>
              Post
            </Button>
          </Modal.Footer>
        </Modal>
        {replies.map((reply) => (
          <ReplyBox
            key={reply._id}
            data={reply.data}
            timestamp={reply.timestamp}
            imageUrl={reply.imageUrl}
            user={reply.user}
          />
        ))}
      </div>
    </ProtectedRoute>
  );
}

export function ReplyBox({ data, timestamp, imageUrl, user }) {
  return (
    <div className="flex gap-2 mb-2">
      <div className="p-0.5 bg-black"></div>
      <div className="flex flex-col">
        <p className="m-0">
          <strong>{user}</strong> replied:
        </p>
        <p className="m-0 pl-1 pt-1">{data}</p>
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Unsupported image URL"
            className="max-w-md h-auto my-2 border-gray-500 border-1 rounded-[6px]"
          />
        )}
      </div>
    </div>
  );
}
