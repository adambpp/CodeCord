// /src/app/search/page.js
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Container, Card, ListGroup, Badge, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const type = searchParams.get("type");
  const { authFetch } = useAuth();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        let endpoint;

        switch (type) {
          case "content":
            endpoint = `http://localhost:3001/api/search/content?query=${encodeURIComponent(
              query
            )}`;
            break;
          case "user-content":
            endpoint = `http://localhost:3001/api/search/user-content?username=${encodeURIComponent(
              query
            )}`;
            break;
          case "most-posts":
            endpoint =
              "http://localhost:3001/api/search/user-stats?sort=most-posts";
            break;
          case "least-posts":
            endpoint =
              "http://localhost:3001/api/search/user-stats?sort=least-posts";
            break;
          case "highest-ranking":
            endpoint = "http://localhost:3001/api/search/ranking?sort=highest";
            break;
          case "lowest-ranking":
            endpoint = "http://localhost:3001/api/search/ranking?sort=lowest";
            break;
          default:
            throw new Error("Invalid search type");
        }

        const response = await authFetch(endpoint);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setResults(data.results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (type) {
      fetchSearchResults();
    }
  }, [query, type]);

  // Helper to render different result types
  const renderResults = () => {
    if (loading) return <p>Loading results...</p>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (results.length === 0) return <p>No results found</p>;

    switch (type) {
      case "content":
      case "user-content":
        return (
          <ListGroup>
            {results.map((item) => (
              <ListGroup.Item key={item._id} className="mb-2">
                <h5>{item.topic || "Reply"}</h5>
                <p>{item.data}</p>
                <small className="text-muted">
                  Posted by {item.user} at{" "}
                  {new Date(item.timestamp).toLocaleString()}
                </small>
              </ListGroup.Item>
            ))}
          </ListGroup>
        );

      case "most-posts":
      case "least-posts":
        return (
          <ListGroup>
            {results.map((user) => (
              <ListGroup.Item
                key={user.username}
                className="d-flex justify-content-between align-items-center"
              >
                <div>{user.name}</div>
                <Badge bg="primary" pill>
                  {user.postCount} posts
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        );

      case "highest-ranking":
      case "lowest-ranking":
        return (
          <ListGroup>
            {results.map((item) => (
              <ListGroup.Item key={item._id} className="mb-2">
                <h5>{item.topic || "Reply"}</h5>
                <p>{item.data}</p>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">Posted by {item.user}</small>
                  <div>
                    <Badge bg="success" className="me-2">
                      {item.upvotes} upvotes
                    </Badge>
                    <Badge bg="danger">{item.downvotes} downvotes</Badge>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        );

      default:
        return <p>Invalid search type</p>;
    }
  };

  // Title for the search results
  const getPageTitle = () => {
    switch (type) {
      case "content":
        return `Search results for "${query}"`;
      case "user-content":
        return `Content by user "${query}"`;
      case "most-posts":
        return "Users with most posts";
      case "least-posts":
        return "Users with least posts";
      case "highest-ranking":
        return "Highest ranked content";
      case "lowest-ranking":
        return "Lowest ranked content";
      default:
        return "Search Results";
    }
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Header as="h2">{getPageTitle()}</Card.Header>
        <Card.Body>{renderResults()}</Card.Body>
      </Card>
    </Container>
  );
}
