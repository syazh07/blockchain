import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import axios from "axios";
import UserData from "./UserData.json";
import "./PoliceDashboard.css";

const contractAddress = "0x3649d53eFA0E6c171763474e6D8F10D25A5EA2a3";

function PoliceDashboard() {
  const [tourists, setTourists] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchTourists();
  }, []);

  const fetchTourists = async () => {
    try {
      if (!window.ethereum) return alert("Install MetaMask!");

      // Fetch off-chain data
      const offChainRes = await axios.get("http://localhost:5000/tourists");
      const offChainData = offChainRes.data;

      // On-chain data
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      if (network.chainId !== 31337 && network.chainId !== 11155111) {
        setStatus("⚠️ Wrong network! Switch to Hardhat or Sepolia.");
        return;
      }

      const contract = new ethers.Contract(contractAddress, UserData.abi, provider);
      const count = (await contract.getTouristCount()).toNumber();

      const mergedTourists = [];
      for (let i = 0; i < count; i++) {
        const t = await contract.getTourist(i);
        const wallet = t[6].toLowerCase();
        mergedTourists.push({
          id: t[0].toNumber(),
          name: t[1],
          phone: t[3],
          emergencyContact: t[4],
          wallet: wallet,
        });
      }

      setTourists(mergedTourists);
      setStatus(`✅ Fetched ${mergedTourists.length} tourists`);
    } catch (err) {
      console.error("Error fetching tourists:", err);
      setStatus("❌ Error fetching tourists");
    }
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-card">
        <h1>Police Dashboard</h1>
        <p>{status}</p>

        {tourists.length === 0 ? (
          <p>No tourists registered yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Emergency Contact</th>
                  <th>Wallet</th>
                </tr>
              </thead>
              <tbody>
                {tourists.map((t) => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.name}</td>
                    <td>{t.phone}</td>
                    <td>{t.emergencyContact}</td>
                    <td>{t.wallet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ML HTML iframe exactly below the table */}
        <h1>Heat Map</h1>
        <iframe
          src="/ml.html"
          title="ML Model"
          width="100%"
          height="500px"
          style={{ border: "1px solid #ccc", borderRadius: "8px", marginTop: "20px" }}
        ></iframe>
      </div>
    </div>
  );
}

export default PoliceDashboard;
