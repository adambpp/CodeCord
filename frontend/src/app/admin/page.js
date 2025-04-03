// /src/app/admin/page.js
"use client";
import { useState } from "react";
import { Table, Button, Modal, Alert, Nav, Tab } from "react-bootstrap";
import AdminRoute from "../components/AdminRoute";
import { useAuth } from "../context/AuthContext";
import Header from "../components/header";
import useSWR from "swr";
import "bootstrap/dist/css/bootstrap.min.css";

// Custom fetcher for SWR that uses our auth context
const useFetch = (url) => {
  const { authFetch } = useAuth();
  const fetcher = (url) => authFetch(url).then((res) => res.json());
  return useSWR(url, fetcher, { refreshInterval: 10000 });
};

export default function AdminDashboard() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({
    id: null,
    type: null,
    name: "",
  });
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const { authFetch } = useAuth();

  // Fetch users, channels data
  const {
    data: usersData,
    error: usersError,
    mutate: mutateUsers,
  } = useFetch("http://localhost:3001/api/users/all");

  const {
    data: channelsData,
    error: channelsError,
    mutate: mutateChannels,
  } = useFetch("http://localhost:3001/api/channels");

  const {
    data: messagesData,
    error: messagesError,
    mutate: mutateMessages,
  } = useFetch("http://localhost:3001/api/posts");

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget({ id: null, type: null, name: "" });
    setDeleteError("");
  };

  const handleShowDeleteModal = (id, type, name) => {
    setDeleteTarget({ id, type, name });
    setShowDeleteModal(true);
    setDeleteError("");
    setDeleteSuccess("");
  };

  const handleDelete = async () => {
    try {
      let url;
      let mutateFunction;

      switch (deleteTarget.type) {
        case "user":
          url = `http://localhost:3001/api/users/${deleteTarget.id}`;
          mutateFunction = mutateUsers;
          break;
        case "channel":
          url = `http://localhost:3001/api/channels/${deleteTarget.id}`;
          mutateFunction = mutateChannels;
          break;
        case "message":
          url = `http://localhost:3001/api/posts/message/${deleteTarget.id}`;
          mutateFunction = mutateMessages;
          break;
        case "reply":
          url = `http://localhost:3001/api/posts/reply/${deleteTarget.id}`;
          mutateFunction = mutateMessages; // Refreshing messages will also refresh replies
          break;
        default:
          throw new Error("Invalid delete target type");
      }

      const response = await authFetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Delete operation failed");
      }

      // Refresh data after successful delete
      if (mutateFunction) {
        mutateFunction();
      }

      setDeleteSuccess(`${deleteTarget.type} deleted successfully`);
      setTimeout(() => {
        handleCloseDeleteModal();
      }, 1500);
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteError(
        error.message || "An error occurred during delete operation"
      );
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          <Tab.Container defaultActiveKey="users">
            <Nav variant="tabs" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="users">Users</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="channels">Channels</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="messages">Messages</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="replies">Replies</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="users">
                <div className="bg-white p-4 rounded shadow">
                  <h2 className="text-xl font-semibold mb-4">
                    User Management
                  </h2>

                  {usersError && (
                    <Alert variant="danger">
                      Failed to load users: {usersError.message}
                    </Alert>
                  )}

                  {!usersData && !usersError && (
                    <Alert variant="info">Loading users...</Alert>
                  )}

                  {usersData && usersData.users && (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Name</th>
                          <th>Role</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersData.users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.name}</td>
                            <td>{user.isAdmin ? "Admin" : "User"}</td>
                            <td>
                              {new Date(user.created_at).toLocaleDateString()}
                            </td>
                            <td>
                              {!user.isAdmin && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    handleShowDeleteModal(
                                      user.id,
                                      "user",
                                      user.username
                                    )
                                  }
                                >
                                  Delete
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="channels">
                <div className="bg-white p-4 rounded shadow">
                  <h2 className="text-xl font-semibold mb-4">
                    Channel Management
                  </h2>

                  {channelsError && (
                    <Alert variant="danger">
                      Failed to load channels: {channelsError.message}
                    </Alert>
                  )}

                  {!channelsData && !channelsError && (
                    <Alert variant="info">Loading channels...</Alert>
                  )}

                  {channelsData && (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Channel Name</th>
                          <th>Description</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(channelsData) &&
                          channelsData.map((channel) => (
                            <tr key={channel.id}>
                              <td>{channel.topic}</td>
                              <td>{channel.description}</td>
                              <td>
                                {new Date(
                                  channel.timestamp
                                ).toLocaleDateString()}
                              </td>
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    handleShowDeleteModal(
                                      channel.id,
                                      "channel",
                                      channel.topic
                                    )
                                  }
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="messages">
                <div className="bg-white p-4 rounded shadow">
                  <h2 className="text-xl font-semibold mb-4">
                    Message Management
                  </h2>

                  {messagesError && (
                    <Alert variant="danger">
                      Failed to load messages: {messagesError.message}
                    </Alert>
                  )}

                  {!messagesData && !messagesError && (
                    <Alert variant="info">Loading messages...</Alert>
                  )}

                  {messagesData && messagesData.messages && (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Topic</th>
                          <th>Content</th>
                          <th>Channel</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {messagesData.messages.map((message) => (
                          <tr key={message._id}>
                            <td>{message.topic}</td>
                            <td>{message.data.substring(0, 50)}...</td>
                            <td>{message.channelId}</td>
                            <td>{message.timestamp}</td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleShowDeleteModal(
                                    message._id,
                                    "message",
                                    message.topic
                                  )
                                }
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="replies">
                <div className="bg-white p-4 rounded shadow">
                  <h2 className="text-xl font-semibold mb-4">
                    Reply Management
                  </h2>

                  {messagesError && (
                    <Alert variant="danger">
                      Failed to load replies: {messagesError.message}
                    </Alert>
                  )}

                  {!messagesData && !messagesError && (
                    <Alert variant="info">Loading replies...</Alert>
                  )}

                  {messagesData && messagesData.replies && (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Message ID</th>
                          <th>Content</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {messagesData.replies.map((reply) => (
                          <tr key={reply._id}>
                            <td>
                              <span title={reply.messageId}>
                                {reply.messageId.substring(0, 10)}...
                              </span>
                            </td>
                            <td>{reply.data.substring(0, 50)}...</td>
                            <td>{reply.timestamp}</td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleShowDeleteModal(
                                    reply._id,
                                    "reply",
                                    reply.data.substring(0, 15) + "..."
                                  )
                                }
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteError && <Alert variant="danger">{deleteError}</Alert>}
          {deleteSuccess && <Alert variant="success">{deleteSuccess}</Alert>}

          {!deleteSuccess && (
            <p>
              Are you sure you want to delete this {deleteTarget.type}:
              <strong> {deleteTarget.name}</strong>?
              {deleteTarget.type === "channel" &&
                " This will also delete all messages in this channel."}
              {deleteTarget.type === "message" &&
                " This will also delete all replies to this message."}
              <br />
              <br />
              This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancel
          </Button>
          {!deleteSuccess && (
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </AdminRoute>
  );
}
