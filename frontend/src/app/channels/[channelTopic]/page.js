// /channels/[channelTopic]/page.js

"use client";
import { use } from "react";
import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import useSWR from "swr";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faArrowUp,
  faArrowDown,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

// Function to handle turning selected text into code format
function formatAsCode(textareaId, value, setValue) {
  const textarea = document.getElementById(textareaId);
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.substring(start, end);

  if (selectedText) {
    // Format the selected text as code by wrapping in triple backticks
    const formattedText = `\`\`\`\n${selectedText}\n\`\`\``;

    // Create the new text with formatted code
    const newText =
      value.substring(0, start) + formattedText + value.substring(end);

    // Update the React state
    setValue(newText);

    // Set cursor position after formatting (we'll need to do this in useEffect)
    setTimeout(() => {
      textarea.selectionStart = start + formattedText.length;
      textarea.selectionEnd = start + formattedText.length;
      textarea.focus();
    }, 0);
  } else {
    // If no text is selected, insert empty code block and place cursor in middle
    const codeBlock = "```\n\n```";
    const cursorPosition = start + 4; // Position after opening backticks and newline

    const newText =
      value.substring(0, start) + codeBlock + value.substring(end);

    // Update the React state
    setValue(newText);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.selectionStart = cursorPosition;
      textarea.selectionEnd = cursorPosition;
      textarea.focus();
    }, 0);
  }
}

// Function to render markdown-style code blocks in content
function renderCodeBlocks(text) {
  if (!text) return "";

  // Replace markdown code blocks with HTML
  return text.replace(/```([\s\S]*?)```/g, (match, code) => {
    const formattedCode = code.trim();
    return `<pre class="bg-gray-800 text-white p-3 my-2 rounded overflow-x-auto"><code>${formattedCode}</code></pre>`;
  });
}

export default function ChannelTopicPage({ params }) {
  // Getting the channel topic from the dynamic route with React.use() as params
  // is a promise
  const channelTopic = decodeURIComponent(use(params).channelTopic);

  const { authFetch, user } = useAuth(); // Get authFetch from context
  // Use authFetch inside a custom fetcher function for SWR
  const fetcher = (url) => authFetch(url).then((res) => res.json());

  // Get the channelId from query parameters
  const searchParams = useSearchParams();
  const channelId = searchParams.get("channelId");

  // State variables and handlers
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContents, setMessageContents] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // State for votes
  const [votes, setVotes] = useState({});

  const createMessage = () => {
    if (!messageTitle || !messageContents) return;

    authFetch("http://localhost:3001/api/posts/newMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: messageTitle,
        data: messageContents,
        imageUrl: imageUrl,
        channelId: channelId,
        user: user.username,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessageTitle("");
          setMessageContents("");
          setImageUrl("");
          handleClose();
        }
      })
      .catch((error) => console.error("Error creating post:", error));
  };

  // Function to handle voting
  const handleVote = async (documentId, voteType) => {
    try {
      const response = await authFetch("http://localhost:3001/api/votes/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, voteType }),
      });

      if (response.ok) {
        // Refresh votes for this document
        fetchVotes([documentId]);
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // Function to fetch votes for multiple documents
  const fetchVotes = async (documentIds) => {
    try {
      const response = await authFetch(
        "http://localhost:3001/api/votes/bulk-votes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentIds }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setVotes((prevVotes) => ({
          ...prevVotes,
          ...data.results,
        }));
      }
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  };

  const { data, error } = useSWR("http://localhost:3001/api/posts", fetcher, {
    refreshInterval: 3000, // Refresh every 3 seconds
    revalidateOnFocus: true, // Optional: Refresh when window regains focus
  });

  // Fetch votes when messages load or change
  useEffect(() => {
    if (data && data.messages) {
      const messageIds = data.messages
        .filter((message) => message.channelId === channelId)
        .map((message) => message._id);

      if (messageIds.length > 0) {
        fetchVotes(messageIds);
      }
    }
  }, [data, channelId]);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  // Only get the messages that have the matching channelId
  const channelMessages = data.messages.filter(
    (message) => message.channelId === channelId
  );

  return (
    <ProtectedRoute>
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
                  id="messageContents"
                  value={messageContents}
                  onChange={(e) => setMessageContents(e.target.value)}
                  placeholder="Enter message content"
                />
                <div className="mt-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() =>
                      formatAsCode(
                        "messageContents",
                        messageContents,
                        setMessageContents
                      )
                    }
                  >
                    <FontAwesomeIcon icon={faCode} className="mr-1" />
                    Format as Code
                  </Button>
                  <small className="text-muted ml-2">
                    Select text first or insert empty code block
                  </small>
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Add Image to Message (optional)</Form.Label>
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
            imageUrl={message.imageUrl}
            user={message.user}
            votes={
              votes[message._id] || { upvotes: 0, downvotes: 0, userVote: null }
            }
            onVote={handleVote}
          />
        ))}
      </div>
    </ProtectedRoute>
  );
}

// Voting buttons component
function VoteButtons({ documentId, votes, onVote }) {
  const { upvotes = 0, downvotes = 0, userVote = null } = votes;

  return (
    <div className="flex flex-col items-center mr-3 mt-2">
      <button
        className={`p-1 ${
          userVote === "upvote" ? "text-orange-500" : "text-gray-500"
        } hover:text-orange-500`}
        onClick={() => onVote(documentId, "upvote")}
        aria-label="Upvote"
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>

      <div className="text-xs font-semibold text-green-600">{upvotes}</div>

      <div className="text-xs font-semibold text-red-600">{downvotes}</div>

      <button
        className={`p-1 ${
          userVote === "downvote" ? "text-blue-500" : "text-gray-500"
        } hover:text-blue-500`}
        onClick={() => onVote(documentId, "downvote")}
        aria-label="Downvote"
      >
        <FontAwesomeIcon icon={faArrowDown} />
      </button>
    </div>
  );
}

export function MessageBox({
  id,
  topic,
  data,
  timestamp,
  channelTopic,
  imageUrl,
  user,
  votes,
  onVote,
}) {
  // Use a function to safely render the message content with code blocks
  const renderContent = (content) => {
    return { __html: renderCodeBlocks(content) };
  };

  return (
    <div className="flex flex-col gap-3 min-w-2xl border-gray-500 border-[0.5px] bg-gray-100 text-black shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-decoration-none p-2">
      <div>
        <p>
          Posted by: <strong>{user}</strong>
        </p>
        <h3 className="font-bold">{topic}</h3>
        <div className="bg-gray-300 p-[0.4px]"></div>
      </div>
      <div className="flex">
        {/* Add voting buttons */}
        <VoteButtons documentId={id} votes={votes} onVote={onVote} />

        <div className="flex-grow">
          {/* Render the content with code blocks support */}
          <div
            className="p-1.5 m-0"
            dangerouslySetInnerHTML={renderContent(data)}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Message related"
              className="max-w-full h-auto my-2"
            />
          )}
        </div>
      </div>
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
