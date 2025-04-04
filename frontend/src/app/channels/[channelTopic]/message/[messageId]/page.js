// /channels/[channelTopic]/message/[messageId]/page.js

"use client";
import { use } from "react";
import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import useSWR from "swr";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComment,
  faReply,
  faArrowUp,
  faArrowDown,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "../../../../components/ProtectedRoute";
import { useAuth } from "../../../../context/AuthContext";
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
  const [replyingTo, setReplyingTo] = useState(null);

  // State for votes
  const [votes, setVotes] = useState({});

  const createReply = () => {
    if (!replyContents) return;

    const replyData = {
      messageId: messageId,
      data: replyContents,
      user: user.username,
      imageUrl: imageUrl,
    };

    // Add parentId if replying to another reply
    if (replyingTo) {
      replyData.parentId = replyingTo.id;
    }

    authFetch("http://localhost:3001/api/posts/newReply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(replyData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReplyContents("");
          setImageUrl("");
          setReplyingTo(null);
          handleClose();
        }
      })
      .catch((error) => console.error("Error creating reply:", error));
  };

  // Function to start replying to a specific reply
  const handleReplyToReply = (reply) => {
    setReplyingTo(reply);
    handleShow();
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

  const { data, error } = useSWR(
    `http://localhost:3001/api/posts/${messageId}`,
    fetcher,
    {
      refreshInterval: 3000, // Refresh every 3 seconds
      revalidateOnFocus: true, // Optional: Refresh when window regains focus
    }
  );

  // Fetch votes when messages/replies load or change
  useEffect(() => {
    if (data && data.message) {
      const allDocumentIds = [data.message._id];

      if (data.replies && data.replies.length > 0) {
        data.replies.forEach((reply) => {
          allDocumentIds.push(reply._id);
        });
      }

      fetchVotes(allDocumentIds);
    }
  }, [data]);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const message = data.message;
  const replies = data.replies;

  // Organize replies into a nested structure
  const organizeReplies = (replies) => {
    // Map to store replies by their ID for quick lookups
    const replyMap = {};

    // First, add all replies to the map
    replies.forEach((reply) => {
      // Clone reply and add children array
      replyMap[reply._id] = { ...reply, children: [] };
    });

    // Root-level replies (direct replies to the message)
    const rootReplies = [];

    // Build the reply tree
    replies.forEach((reply) => {
      const replyWithChildren = replyMap[reply._id];

      if (reply.parentId && replyMap[reply.parentId]) {
        // This is a nested reply, add it to its parent's children
        replyMap[reply.parentId].children.push(replyWithChildren);
      } else {
        // This is a root reply (direct reply to the message)
        rootReplies.push(replyWithChildren);
      }
    });

    return rootReplies;
  };

  const nestedReplies = organizeReplies(replies);

  // Use a function to safely render the message content with code blocks
  const renderContent = (content) => {
    return { __html: renderCodeBlocks(content) };
  };

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

        <div className="flex">
          {/* Voting buttons for the main message */}
          <VoteButtons
            documentId={message._id}
            votes={
              votes[message._id] || { upvotes: 0, downvotes: 0, userVote: null }
            }
            onVote={handleVote}
          />

          <div className="flex-grow">
            {/* Render the content with code blocks support */}
            <div
              className="p-1.5 m-0"
              dangerouslySetInnerHTML={renderContent(message.data)}
            />
            {message.imageUrl && (
              <img
                src={message.imageUrl}
                alt="Message related"
                className="max-w-full h-auto my-2"
              />
            )}
            <small className="flex justify-end">
              Created: {message.timestamp}
            </small>
          </div>
        </div>

        <div className="bg-gray-300 p-[0.3px]"></div>
        <Button
          variant="primary"
          onClick={() => {
            setReplyingTo(null);
            handleShow();
          }}
          className="bg-black font-medium max-w-[100px] text-white p-2 rounded-md border-white"
        >
          Reply
        </Button>

        <Modal show={show} variant="primary">
          <Modal.Header closeButton onClick={handleClose}>
            <Modal.Title>
              {replyingTo
                ? `Reply to ${replyingTo.user}'s comment`
                : "Create New Reply"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {replyingTo && (
              <div className="mb-3 p-2 bg-gray-100 border-l-4 border-gray-400">
                <p className="text-sm text-gray-600">
                  <strong>{replyingTo.user}</strong> wrote:
                </p>
                <p className="text-sm">{replyingTo.data}</p>
              </div>
            )}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  id="replyContents"
                  value={replyContents}
                  onChange={(e) => setReplyContents(e.target.value)}
                  placeholder="What would you like to say?"
                />
                <div className="mt-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() =>
                      formatAsCode(
                        "replyContents",
                        replyContents,
                        setReplyContents
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

        {/* Render the nested replies */}
        {nestedReplies.map((reply) => (
          <ReplyBox
            key={reply._id}
            reply={reply}
            onReplyClick={handleReplyToReply}
            level={0}
            votes={
              votes[reply._id] || { upvotes: 0, downvotes: 0, userVote: null }
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

// Updated ReplyBox component to handle nested replies and votes
export function ReplyBox({ reply, onReplyClick, level = 0, votes, onVote }) {
  const { _id, data, timestamp, imageUrl, user, children } = reply;
  const maxNestingLevel = 5; // Prevent excessive nesting

  // Use a function to safely render the reply content with code blocks
  const renderContent = (content) => {
    return { __html: renderCodeBlocks(content) };
  };

  return (
    <div className="mb-2">
      <div className="flex gap-2" style={{ marginLeft: `${level * 20}px` }}>
        <div className="p-0.5 bg-black"></div>

        {/* Add voting buttons */}
        <VoteButtons documentId={_id} votes={votes} onVote={onVote} />

        <div className="flex flex-col flex-grow">
          <div className="flex justify-between items-center">
            <p className="m-0">
              <strong>{user}</strong> replied:
            </p>
            <small className="text-gray-500">{timestamp}</small>
          </div>
          {/* Render the content with code blocks support */}
          <div
            className="m-0 pl-1 pt-1"
            dangerouslySetInnerHTML={renderContent(data)}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Unsupported image URL"
              className="max-w-md h-auto my-2 border-gray-500 border-1 rounded-[6px]"
            />
          )}

          {/* Reply button */}
          <div className="mt-2">
            <button
              onClick={() => onReplyClick({ id: _id, data, user })}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faReply} size="sm" />
              Reply
            </button>
          </div>
        </div>
      </div>

      {/* Render children replies */}
      {children && children.length > 0 && level < maxNestingLevel && (
        <div className="mt-2">
          {children.map((childReply) => (
            <ReplyBox
              key={childReply._id}
              reply={childReply}
              onReplyClick={onReplyClick}
              level={level + 1}
              votes={
                votes[childReply._id] || {
                  upvotes: 0,
                  downvotes: 0,
                  userVote: null,
                }
              }
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}
