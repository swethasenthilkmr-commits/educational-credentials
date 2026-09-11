const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Helper to compute canonical Keccak-256 credential hash
function computeCanonicalHash(cred) {
  // studentId|studentAddress|degreeTitle|major|institution|graduationDate|credentialType
  const canonicalString = `${cred.studentId}|${cred.studentAddress.toLowerCase()}|${cred.degreeTitle}|${cred.major}|${cred.institution}|${cred.graduationDate}|${cred.credentialType}`;
  return hre.ethers.keccak256(hre.ethers.toUtf8Bytes(canonicalString));
}

async function main() {
  const [deployer, studentAccount1, studentAccount2] = await hre.ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("Seeding Demo Educational Credentials...");
  console.log("Registrar / Deployer:", deployer.address);
  console.log("Student 1:", studentAccount1.address);
  console.log("Student 2:", studentAccount2.address);

  const frontendContractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  const contractAddressPath = path.join(frontendContractsDir, "contractAddress.json");

  if (!fs.existsSync(contractAddressPath)) {
    throw new Error("Contract address file not found. Run scripts/deploy.js first.");
  }

  const contractInfo = JSON.parse(fs.readFileSync(contractAddressPath, "utf8"));
  const EducationalCredential = await hre.ethers.getContractFactory("EducationalCredential");
  const contract = EducationalCredential.attach(contractInfo.address);

  // Demo credential metadata
  const demoCredentials = [
    {
      studentId: "STU-2024-001",
      studentAddress: studentAccount1.address,
      studentName: "Aarav Sharma", // For off-chain metadata only!
      degreeTitle: "Bachelor of Technology in Computer Science",
      major: "Artificial Intelligence & Decentralized Systems",
      institution: "Metropolitan University of Technology",
      graduationDate: "2028-05-20",
      credentialType: "Degree",
      gpa: "3.92 / 4.0",
      honors: "First Class with Distinction",
      version: "1.0",
      metadataURI: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/credential_1.json",
    },
    {
      studentId: "STU-2024-002",
      studentAddress: studentAccount1.address,
      studentName: "Aarav Sharma",
      degreeTitle: "Postgraduate Diploma in Cloud Security & DevOps",
      major: "Cybersecurity & Blockchain",
      institution: "Metropolitan University of Technology",
      graduationDate: "2029-01-15",
      credentialType: "Diploma",
      gpa: "4.0 / 4.0",
      honors: "Dean's Honor Roll",
      version: "1.0",
      metadataURI: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/credential_2.json",
    },
    {
      studentId: "STU-2024-089",
      studentAddress: studentAccount2.address,
      studentName: "Priya Patel",
      degreeTitle: "Bachelor of Science in Data Science",
      major: "Statistical Computing & Big Data",
      institution: "Metropolitan University of Technology",
      graduationDate: "2027-11-30",
      credentialType: "Degree",
      gpa: "3.85 / 4.0",
      honors: "Magna Cum Laude",
      version: "1.0",
      metadataURI: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/credential_3.json",
    },
  ];

  // Save metadata to frontend demo fixtures so local mock gateway can serve it instantly
  const demoFixturesDir = path.join(__dirname, "..", "frontend", "src", "fixtures");
  if (!fs.existsSync(demoFixturesDir)) {
    fs.mkdirSync(demoFixturesDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(demoFixturesDir, "demoCredentials.json"),
    JSON.stringify(demoCredentials, null, 2)
  );

  console.log(`Saved ${demoCredentials.length} demo credential definitions to frontend/src/fixtures/`);

  for (let i = 0; i < demoCredentials.length; i++) {
    const cred = demoCredentials[i];
    const credHash = computeCanonicalHash(cred);
    console.log(`Minting SBT #${i + 1} for ${cred.studentId} (${cred.studentAddress})...`);
    console.log(`- Canonical Hash: ${credHash}`);

    const tx = await contract.connect(deployer).safeMintSBT(
      cred.studentAddress,
      cred.metadataURI,
      credHash
    );
    await tx.wait();
    console.log(`- Credential #${i + 1} minted successfully!`);
  }

  console.log("----------------------------------------------------");
  console.log("Seeding complete! All credentials are soulbound and anchored.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
