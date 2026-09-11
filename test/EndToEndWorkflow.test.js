const { expect } = require("chai");
const { ethers } = require("hardhat");
const { toCanonicalString, computeCredentialHash } = require("../ipfs/upload");

describe("Complete End-to-End Demonstration Scenario (Section 36)", function () {
  let EducationalCredential;
  let contract;
  let registrar, student, thirdPartyEmployer, unauthorizedAccount;

  before(async function () {
    [registrar, student, thirdPartyEmployer, unauthorizedAccount] = await ethers.getSigners();

    EducationalCredential = await ethers.getContractFactory("EducationalCredential");
    contract = await EducationalCredential.deploy(registrar.address);
    await contract.waitForDeployment();
  });

  it("Executes the complete 15-step demo workflow flawlessly", async function () {
    console.log("\n========================================================");
    console.log("STARTING SECTION 36 FULL DEMONSTRATION WORKFLOW");
    console.log("========================================================");

    // Step 1: Registrar connects issuer wallet
    const ISSUER_ROLE = await contract.ISSUER_ROLE();
    expect(await contract.hasRole(ISSUER_ROLE, registrar.address)).to.be.true;
    console.log("✓ Step 1: Registrar connected with ISSUER_ROLE:", registrar.address);

    // Step 2 & 3: Registrar creates credential metadata
    const credentialData = {
      studentId: "STU001",
      studentAddress: student.address,
      degreeTitle: "B.Tech Computer Science",
      major: "Computer Science",
      institution: "Example University",
      graduationDate: "15 May 2029",
      credentialType: "Degree",
      version: "1.0",
    };
    console.log("✓ Step 2 & 3: Metadata generated for student:", credentialData.studentId);

    // Step 4: Application generates canonical string and Keccak-256 hash
    const canonical = toCanonicalString(credentialData);
    const expectedCanonical = "STU001|" + student.address.toLowerCase() + "|B.Tech Computer Science|Computer Science|Example University|15 May 2029|Degree";
    expect(canonical).to.equal(expectedCanonical);

    const credentialHash = computeCredentialHash(credentialData);
    expect(credentialHash).to.be.properHex(64);
    console.log("✓ Step 4: Canonical Keccak-256 hash computed:", credentialHash);

    // Step 5: Metadata is uploaded to IPFS (CID obtained)
    const simulatedCid = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
    const metadataURI = `ipfs://${simulatedCid}/stu001.json`;
    console.log("✓ Step 5: Metadata pinned to IPFS. URI:", metadataURI);

    // Step 6 & 7: Registrar confirms transaction and smart contract mints credential
    const mintTx = await contract.connect(registrar).safeMintSBT(
      student.address,
      metadataURI,
      credentialHash
    );
    const receipt = await mintTx.wait();
    expect(receipt.status).to.equal(1);
    const tokenId = 1n;
    console.log("✓ Step 6 & 7: SBT Token #1 minted in tx:", receipt.hash);

    // Step 8: Credential becomes soulbound
    expect(await contract.locked(tokenId)).to.be.true;
    console.log("✓ Step 8: Credential locked(1) confirmed as true (ERC-5192 Soulbound)");

    // Step 9: Student connects wallet and views credential
    const studentBalance = await contract.balanceOf(student.address);
    expect(studentBalance).to.equal(1n);
    const studentTokens = await contract.getStudentTokens(student.address);
    expect(studentTokens[0]).to.equal(tokenId);
    console.log("✓ Step 9: Student wallet owns Token #1");

    // Step 10: Non-transferability check (Attempted transfer MUST revert)
    await expect(
      contract.connect(student).transferFrom(student.address, thirdPartyEmployer.address, tokenId)
    ).to.be.revertedWithCustomError(contract, "ErrSoulboundTokenLocked");
    console.log("✓ Step 10: Transfer attempt rejected: ErrSoulboundTokenLocked");

    // Step 11 & 12: Verifier retrieves credential information
    const cred = await contract.getCredential(tokenId);
    expect(cred.student).to.equal(student.address);
    expect(cred.isLocked).to.be.true;
    expect(cred.revokedStatus).to.be.false;
    expect(cred.credentialHash).to.equal(credentialHash);

    // Step 13: Verifier checks hash matches
    const recomputedHash = computeCredentialHash(credentialData);
    expect(recomputedHash).to.equal(cred.credentialHash);
    console.log("✓ Step 13: Verifier confirms: ✓ CREDENTIAL VERIFIED (Valid, Soulbound, Hash Matched)");

    // Step 14: Registrar revokes credential
    const revocationReason = "Academic misconduct: Honor code violation";
    const revokeTx = await contract.connect(registrar).revokeCredential(tokenId, revocationReason);
    await revokeTx.wait();
    console.log("✓ Step 14: Registrar revoked credential. Reason:", revocationReason);

    // Step 15: Verifier checks again
    const updatedCred = await contract.getCredential(tokenId);
    expect(updatedCred.revokedStatus).to.be.true;
    expect(updatedCred.revocationReason).to.equal(revocationReason);
    // Historical record remains intact
    expect(updatedCred.student).to.equal(student.address);
    expect(updatedCred.credentialHash).to.equal(credentialHash);
    console.log("✓ Step 15: Verifier checks again -> ⚠ CREDENTIAL REVOKED");
    console.log("========================================================\n");
  });
});
