// /src/app/components/header.js
"use client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  return (
    <div className="bg-gray-100 flex justify-between items-center p-3 shadow-md">
      <div>
        <Link href="/" className="text-decoration-none">
          <h1 className="font-bold text-2xl text-black">CodeCord</h1>
        </Link>
      </div>

      {user && (
        <div className="flex items-center">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-basic">
              {user.name} {isAdmin && "(Admin)"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item as={Link} href="/profile">
                Profile
              </Dropdown.Item>

              {isAdmin && (
                <Dropdown.Item as={Link} href="/admin">
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
