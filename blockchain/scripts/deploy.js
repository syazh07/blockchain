import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // ✅ Use exact contract name
  const UserData = await hre.ethers.getContractFactory("UserData");

  // Ethers v6: deploy() returns deployed contract
  const contract = await UserData.deploy();

  console.log("Contract deployed to:", contract.target); // deployed address
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});  
