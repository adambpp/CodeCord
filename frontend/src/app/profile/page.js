// Create a file at /src/app/profile/page.js
"use client";
import { useState, useEffect } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import Header from "../components/header";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ProfilePage() {
  const { user, authFetch } = useAuth();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate passwords if the user is trying to change them
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setError("New passwords don't match");
        setLoading(false);
        return;
      }

      if (!currentPassword) {
        setError("Current password is required to set a new password");
        setLoading(false);
        return;
      }
    }

    try {
      const response = await authFetch(
        "http://localhost:3001/api/users/update-profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            currentPassword: currentPassword || undefined,
            newPassword: newPassword || undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update local storage with new user info
      const updatedUser = { ...user, name: data.user.name };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Profile updated successfully");

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        <Header />

        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-6">Your Profile</h1>

          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Account Information</Card.Title>
              <div className="mb-3">
                <strong>Username:</strong> {user?.username}
              </div>
              <div className="mb-3">
                <strong>Role:</strong>{" "}
                {user?.isAdmin ? "Administrator" : "User"}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Update Profile</Card.Title>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleUpdateProfile}>
                <Form.Group className="mb-4">
                  <Form.Label>Display Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your display name"
                    required
                  />
                </Form.Group>

                <hr className="my-4" />
                <h5>Change Password (Optional)</h5>

                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
