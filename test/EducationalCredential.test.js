const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EducationalCredential - ERC-5192 Soulbound Token", function () {
  let EducationalCredential;
  let contract;
  let admin, issuer, student1, student2, unauthorizedUser;

  // Sample credential test data
  const sampleStudentId = "STU2024001";
  const sampleDegree = "B.Tech in Computer Science and Engineering";
  const sampleMajor = "Artificial Intelligence and Machine Learning";
  const sampleInstitution = "Apex Institute of Technology";
  const sampleGradDate = "2028-05-30";
  const sampleMetadataURI = "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";

  // Deterministic canonical string: studentId|studentAddress|degreeTitle|major|institution|graduationDate|credentialType
  let sampleHash;

  beforeEach(async function () {
    [admin, issuer, student1, student2, unauthorizedUser] = await ethers.getSigners();

    const canonicalString = `${sampleStudentId}|${student1.address.toLowerCase()}|${sampleDegree}|${sampleMajor}|${sampleInstitution}|${sampleGradDate}|Degree`;
    sampleHash = ethers.keccak256(ethers.toUtf8Bytes(canonicalString));

    EducationalCredential = await ethers.getContractFactory("EducationalCredential");
    contract = await EducationalCredential.deploy(admin.address);
    await contract.waitForDeployment();

    // Grant ISSUER_ROLE to issuer account
    const ISSUER_ROLE = await contract.ISSUER_ROLE();
    await contract.connect(admin).grantRole(ISSUER_ROLE, issuer.address);
  });

  describe("1. Deployment & Roles", function () {
    it("Test 1: Contract deploys successfully with correct name, symbol, and admin role", async function () {
      expect(await contract.name()).to.equal("Educational Soulbound Credential");
      expect(await contract.symbol()).to.equal("EDUSBT");

      const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
      const ISSUER_ROLE = await contract.ISSUER_ROLE();

      expect(await contract.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await contract.hasRole(ISSUER_ROLE, admin.address)).to.be.true;
      expect(await contract.hasRole(ISSUER_ROLE, issuer.address)).to.be.true;
    });

    it("Should support ERC-5192 interface (0xb45a3c0e)", async function () {
      const ERC5192_INTERFACE_ID = "0xb45a3c0e";
      expect(await contract.supportsInterface(ERC5192_INTERFACE_ID)).to.be.true;
    });
  });

  describe("2. Minting Educational Credentials", function () {
    it("Test 2: Authorized issuer can mint a credential", async function () {
      const tx = await contract.connect(issuer).safeMintSBT(student1.address, sampleMetadataURI, sampleHash);
      const receipt = await tx.wait();

      expect(await contract.getTotalIssued()).to.equal(1n);
      expect(await contract.ownerOf(1)).to.equal(student1.address);
    });

    it("Test 3: Unauthorized account cannot mint a credential", async function () {
      await expect(
        contract.connect(unauthorizedUser).safeMintSBT(student1.address, sampleMetadataURI, sampleHash)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("Test 4: Credential is assigned to the correct student wallet", async function () {
      await contract.connect(issuer).safeMintSBT(student1.address, sampleMetadataURI, sampleHash);
      expect(await contract.ownerOf(1)).to.equal(student1.address);
      expect(await contract.balanceOf(student1.address)).to.equal(1n);

      const studentTokens = await contract.getStudentTokens(student1.address);
      expect(studentTokens.length).to.equal(1);
      expect(studentTokens[0]).to.equal(1n);
    });

    it("Test 11 & 12: Correct IPFS URI and credential hash are stored and retrievable", async function () {
      await contract.connect(issuer).safeMintSBT(student1.address, sampleMetadataURI, sampleHash);

      expect(await contract.tokenURI(1)).to.equal(sampleMetadataURI);

      const cred = await contract.getCredential(1);
      expect(cred.student).to.equal(student1.address);
      expect(cred.credentialHash).to.equal(sampleHash);
      expect(cred.metadataURI).to.equal(sampleMetadataURI);
      expect(cred.isLocked).to.be.true;
      expect(cred.revokedStatus).to.be.false;
      expect(cred.revocationReason).to.equal("");
      expect(cred.issueDate).to.be.gt(0n);
    });

    it("Test 13: Relevant events are emitted upon minting (Locked & CredentialIssued)", async function () {
      await expect(contract.connect(issuer).safeMintSBT(student1.address, sampleMetadataURI, sampleHash))
        .to.emit(contract, "Locked")
        .withArgs(1n)
        .and.to.emit(contract, "CredentialIssued");
    });
  });

  describe("3. Soulbound (Non-Transferability) Enforcement", function () {
    beforeEach(async function () {
      await contract.connect(issuer).safeMintSBT(student1.address, sampleMetadataURI, sampleHash);
    });

    it("Test 5 & 6: Credential is locked and locked(tokenId) returns true", async function () {
      expect(await contract.locked(1)).to.be.true;
    });

    it("Test 7: Attempting to transfer the credential fails (reverts with ErrSoulboundTokenLocked)", async function () {
      // Direct transferFrom attempt by student
      await expect(
        contract.connect(student1).transferFrom(student1.address, student2.address, 1)
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundTokenLocked")
        .withArgs(1n);

      // Safe transfer attempt by student
      await expect(
        contract.connect(student1)["safeTransferFrom(address,address,uint256)"](
          student1.address,
          student2.address,
          1
        )
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundTokenLocked")
        .withArgs(1n);

      // Transfer attempt by third party
      await expect(
        contract.connect(unauthorizedUser).transferFrom(student1.address, student2.address, 1)
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundTokenLocked")
        .withArgs(1n);

      // Owner should still be student1
      expect(await contract.ownerOf(1)).to.equal(student1.address);
    });
  });

  describe("4. Revocation Mechanism", function () {
    beforeEach(async function () {
      await contract.connect(issuer).safeMintSBT(student1.address, sampleMetadataURI, sampleHash);
    });

    it("Test 8: Unauthorized user cannot revoke a credential", async function () {
      await expect(
        contract.connect(unauthorizedUser).revokeCredential(1, "Academic misconduct")
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("Test 9 & 10: Authorized issuer can revoke a credential, reflecting revoked status", async function () {
      const reason = "Academic integrity violation: Plagiarized thesis";
      
      await expect(contract.connect(issuer).revokeCredential(1, reason))
        .to.emit(contract, "CredentialRevoked");

      expect(await contract.isRevoked(1)).to.be.true;

      const cred = await contract.getCredential(1);
      expect(cred.revokedStatus).to.be.true;
      expect(cred.revocationReason).to.equal(reason);

      // Historical record remains intact
      expect(await contract.ownerOf(1)).to.equal(student1.address);
      expect(cred.credentialHash).to.equal(sampleHash);
    });

    it("Cannot revoke an already revoked credential", async function () {
      await contract.connect(issuer).revokeCredential(1, "Clerical error");
      await expect(
        contract.connect(issuer).revokeCredential(1, "Second attempt")
      ).to.be.revertedWithCustomError(contract, "ErrTokenAlreadyRevoked")
        .withArgs(1n);
    });
  });

  describe("5. Query Helpers & Edge Cases", function () {
    it("Should return all tokens for student and all tokens in contract", async function () {
      await contract.connect(issuer).safeMintSBT(student1.address, sampleMetadataURI, sampleHash);
      
      const secondHash = ethers.keccak256(ethers.toUtf8Bytes("SECOND_CREDENTIAL"));
      await contract.connect(issuer).safeMintSBT(student1.address, sampleMetadataURI, secondHash);

      const studentTokens = await contract.getStudentTokens(student1.address);
      expect(studentTokens.length).to.equal(2);
      expect(studentTokens[0]).to.equal(1n);
      expect(studentTokens[1]).to.equal(2n);

      const allTokens = await contract.getAllTokens();
      expect(allTokens.length).to.equal(2);
    });

    it("Querying non-existent token should revert", async function () {
      await expect(contract.locked(999)).to.be.revertedWithCustomError(contract, "ErrTokenDoesNotExist");
      await expect(contract.isRevoked(999)).to.be.revertedWithCustomError(contract, "ErrTokenDoesNotExist");
      await expect(contract.getCredential(999)).to.be.revertedWithCustomError(contract, "ErrTokenDoesNotExist");
    });
  });
});
