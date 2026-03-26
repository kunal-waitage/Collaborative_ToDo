"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import Link from "next/link";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSignup() {
    if (!username || !email || !password) {
      setError("All fields are required");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = userCredential.user.uid;

      await set(ref(db, "users/" + uid), { username, email });
      await set(ref(db, "usernames/" + username), uid);

      window.location.href = "/login";
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <p className="error-msg">{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="form-control mb-2"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="form-control mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="form-control mb-2"
      />
      <button onClick={handleSignup} className="btn btn-outline-danger w-100">
        Sign Up
      </button>
      <p className="mt-2">
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}
