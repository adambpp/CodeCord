// /src/app/components/header.js
"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Dropdown, Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("content");

  // Search types with human-readable labels
  const searchOptions = [
    { value: "content", label: "Content with string" },
    { value: "user-content", label: "Content by user" },
    { value: "most-posts", label: "Users with most posts" },
    { value: "least-posts", label: "Users with least posts" },
    { value: "highest-ranking", label: "Highest ranked content" },
    { value: "lowest-ranking", label: "Lowest ranked content" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();

    // Navigate to search results page with query parameters
    router.push(
      `/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`
    );
  };

  return (
    <div className="bg-gray-100 flex justify-between items-center p-3 shadow-md">
      <div>
        <Link href="/" className="text-decoration-none">
          <h1 className="font-bold text-2xl text-black">CodeCord</h1>
        </Link>
      </div>

      {/* Search Form */}
      <div className="flex-grow mx-4">
        <Form className="d-flex" onSubmit={handleSearch}>
          <Dropdown
            className="me-2"
            onSelect={(selectedKey) => setSearchType(selectedKey)}
          >
            <Dropdown.Toggle variant="light" id="search-type-dropdown">
              {searchOptions.find((option) => option.value === searchType)
                ?.label || "Search by"}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {searchOptions.map((option) => (
                <Dropdown.Item key={option.value} eventKey={option.value}>
                  {option.label}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          <Form.Control
            type="search"
            placeholder="Search..."
            className="me-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required={["content", "user-content"].includes(searchType)}
          />
          <Button variant="outline-primary" type="submit">
            Search
          </Button>
        </Form>
      </div>

      {user && (
        <div className="flex items-center">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-basic">
              {user.name} {isAdmin && "(Admin)"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {/* Modified here: Use onClick with router.push instead of as={Link} */}
              <Dropdown.Item onClick={() => router.push("/profile")}>
                Profile
              </Dropdown.Item>

              {isAdmin && (
                <Dropdown.Item onClick={() => router.push("/admin")}>
                  Admin Dashboard
                </Dropdown.Item>
              )}

              <Dropdown.Divider />

              <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      )}
    </div>
  );
}
