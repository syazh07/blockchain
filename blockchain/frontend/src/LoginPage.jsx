import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginPage.css";

const POLICE_USERNAME = "admin";
const POLICE_PASSWORD = "password";
const BACKEND_URL = "http://localhost:5000";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [wallet, setWallet] = useState("");
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
    } catch (err) {
      console.error(err);
      alert("Failed to connect wallet");
    }
  };

  const registerTourist = async () => {
    if (!wallet) return alert("Connect wallet first!");
    try {
      await axios.post(`${BACKEND_URL}/tourists`, { wallet });
      alert("✅ Registered successfully! You can now login.");
    } catch (err) {
      console.error(err);
      alert("❌ Registration failed");
    }
  };

  const handleLogin = async () => {
    if (username === POLICE_USERNAME && password === POLICE_PASSWORD) {
      navigate("/police");
      return;
    }

    if (!wallet) return alert("Connect wallet first for tourist login!");
    try {
      const res = await axios.get(`${BACKEND_URL}/tourists?wallet=${wallet}`);
      if (res.data.length > 0) navigate("/tourist");
      else alert("❌ Wallet not registered yet. Please register as tourist.");
    } catch (err) {
      console.error(err);
      alert("❌ Error checking wallet");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="container">
        <h1>Login</h1>

        <h3>Police Login</h3>
        <input type="text" placeholder="Police Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Police Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <h3>Tourist Login via Wallet</h3>
        {!wallet && <button onClick={connectWallet}>Connect Wallet</button>}
        {wallet && (
          <>
            <p>Connected wallet: {wallet}</p>
            <button onClick={registerTourist}>Register as Tourist</button>
          </>
        )}

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default LoginPage;
