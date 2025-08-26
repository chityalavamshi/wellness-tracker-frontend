import React, { useState } from "react";

interface AuthCardProps {
  onLogin: (username: string) => void;
}

export function AuthCard({ onLogin }: AuthCardProps) {
  const [username, setUsername] = useState("");

  return (
    <div className="p-4 shadow-md rounded-md bg-white w-80">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input
        type="text"
        placeholder="Enter your name"
        className="border p-2 rounded w-full mb-4"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded w-full"
        onClick={() => onLogin(username)}
      >
        Login
      </button>
    </div>
  );
}
