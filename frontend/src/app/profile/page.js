// /src/app/profile/page.js
"use client";
import { useState, useEffect } from "react";
import { Card } from "react-bootstrap";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ProfilePage() {
  const { user, authFetch } = useAuth();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
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
        </div>
      </div>
    </ProtectedRoute>
  );
}
