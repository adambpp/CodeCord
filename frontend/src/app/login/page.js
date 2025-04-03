"use client";
import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Get login function from context

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login Failed");
      }

      // Use the login function from context to update app state
      login(data.user, data.token);

      // Redirect to channels page
      router.push("/channels");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Login to CodeCord
        </h1>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-4">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Form>

        <div className="mt-4 text-center">
          <p>
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
