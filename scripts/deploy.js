const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("Deploying EducationalCredential contract...");
  console.log("Deployer Address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer Balance:", hre.ethers.formatEther(balance), "ETH");

  const EducationalCredential = await hre.ethers.getContractFactory("EducationalCredential");
  const contract = await EducationalCredential.deploy(deployer.address);

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  const network = await hre.ethers.provider.getNetwork();

  console.log("EducationalCredential deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Network Name:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("----------------------------------------------------");

  // Save artifacts for frontend
  const frontendContractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const contractInfo = {
    address: contractAddress,
    chainId: Number(network.chainId),
    networkName: network.name,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(frontendContractsDir, "contractAddress.json"),
    JSON.stringify(contractInfo, null, 2)
  );

  // Copy Contract ABI artifact
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "EducationalCredential.sol",
    "EducationalCredential.json"
  );

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    fs.writeFileSync(
      path.join(frontendContractsDir, "EducationalCredential.json"),
      JSON.stringify(artifact, null, 2)
    );
    console.log("Frontend ABI and address exported to frontend/src/contracts/");
  }

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
