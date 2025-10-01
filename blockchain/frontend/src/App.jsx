import React, { useState } from "react";
import { ethers } from "ethers";
import UserData from "./UserData.json";
import { QRCodeCanvas } from "qrcode.react";
import "./App.css";

const contractAddress = "0x3649d53eFA0E6c171763474e6D8F10D25A5EA2a3";
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Sepolia Testnet
const BACKEND_URL = "http://localhost:5000"; // your backend for QR redirect

function App() {
  const [form, setForm] = useState({
    name: "",
    passportOrAadhar: "",
    phone: "",
    emergencyContact: "",
    numDays: 1,
    tripDetails: [""],
  });

  const [wallet, setWallet] = useState(null);
  const [status, setStatus] = useState({ message: "", type: "" });
  const [qrLink, setQrLink] = useState("");

  // Switch network to Sepolia
  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: "Sepolia Testnet",
              rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/hS5HVbN_1wB-UltAzm6Rf"],
              nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else throw switchError;
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");
    try {
      await switchToSepolia();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
      setStatus({ message: `✅ Connected wallet: ${accounts[0]}`, type: "success" });
    } catch (err) {
      console.error(err);
      setStatus({ message: `❌ Failed to connect: ${err.message}`, type: "error" });
    }
  };

  // Form handlers
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleDaysChange = (e) => {
    const days = parseInt(e.target.value) || 1;
    setForm({ ...form, numDays: days, tripDetails: Array(days).fill("") });
  };

  const handleDayPlaceChange = (index, value) => {
    const newTripDetails = [...form.tripDetails];
    newTripDetails[index] = value;
    setForm({ ...form, tripDetails: newTripDetails });
  };

  // Register tourist on-chain only
  const registerTourist = async () => {
    if (!wallet) return alert("Connect wallet first!");
    if (!form.name || !form.passportOrAadhar) return alert("Fill Name and Passport/Aadhaar");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111) {
        setStatus({ message: "⚠️ Wrong network! Switch to Sepolia.", type: "error" });
        return;
      }

      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, UserData.abi, signer);

      // On-chain registration
      const tx = await contract.registerTourist(
        form.name,
        form.passportOrAadhar,
        form.phone || "N/A",
        form.emergencyContact || "N/A",
        0 // optional field
      );
      await tx.wait();

      setStatus({ message: "✅ Registered on blockchain!", type: "success" });

      // Generate QR link for Flutter app
      const publicLink = `${BACKEND_URL}/login?id=${wallet}`;
      setQrLink(publicLink);

      // Reset form
      setForm({
        name: "",
        passportOrAadhar: "",
        phone: "",
        emergencyContact: "",
        numDays: 1,
        tripDetails: [""],
      });
    } catch (err) {
      console.error(err);
      setStatus({ message: `❌ Error: ${err.reason || err.message}`, type: "error" });
    }
  };

  return (
    <div className="app-wrapper">
      <div className="card">
        <h1>Smart Tourist Digital ID</h1>

        {!wallet && <button onClick={connectWallet}>Connect Wallet</button>}

        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input type="text" name="passportOrAadhar" placeholder="Passport/Aadhaar" value={form.passportOrAadhar} onChange={handleChange} />
        <input type="text" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input type="text" name="emergencyContact" placeholder="Emergency Contact" value={form.emergencyContact} onChange={handleChange} />

        <input type="number" min="1" placeholder="Number of Days" onChange={handleDaysChange} />
        {form.tripDetails.map((day, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Day ${index + 1} Places`}
            value={day}
            onChange={(e) => handleDayPlaceChange(index, e.target.value)}
          />
        ))}

        <button onClick={registerTourist} disabled={!wallet}>Register Tourist</button>

        {status.message && <div className={`status ${status.type}`}>{status.message}</div>}

        {/* QR code display */}
        {qrLink && (
          <div style={{ marginTop: "20px" }}>
            <p>Scan QR to open in Flutter app:</p>
            <QRCodeCanvas value={qrLink} size={180} />
            <p><a href={qrLink} target="_blank" rel="noopener noreferrer">{qrLink}</a></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
