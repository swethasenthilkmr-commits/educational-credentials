import React from 'react';
import { 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  Lock, 
  Database, 
  HeartHandshake, 
  Layers, 
  Award, 
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AboutPage = () => {
  const vivaQuestions = [
    {
      q: '1. What is an ERC-5192 Soulbound Token (SBT), and how does it differ from a regular ERC-721 NFT?',
      a: 'A standard ERC-721 NFT is freely transferable and tradable between any two wallet addresses. An ERC-5192 token introduces a minimal standard for "Soulbound" non-transferable tokens. In our smart contract (EducationalCredential.sol), the _update hook overrides transfer attempts so that any movement between regular addresses reverts with ErrSoulboundTokenLocked. The contract emits a Locked(tokenId) event and returns locked(tokenId) == true.',
    },
    {
      q: '2. Why is Personally Identifiable Information (PII) kept off-chain on IPFS instead of on the public blockchain?',
      a: 'Blockchains are public, immutable, and permanent. Writing student personal data (full name, student ID, GPA, date of birth) directly into contract storage would violate privacy-by-design principles (and regulations such as GDPR and FERPA). Instead, we store metadata off-chain on IPFS and anchor only a 32-byte Keccak-256 cryptographic hash on the blockchain. The hash acts as a tamper-evident seal without exposing confidential data.',
    },
    {
      q: '3. What is canonical serialization and why is it crucial for hash verification?',
      a: 'JSON serialization can produce varying strings if keys are ordered differently or spacing changes. To ensure determinism, we define a canonical string: "studentId|studentAddress|degreeTitle|major|institution|graduationDate|credentialType". Both during issuance and verification, this exact format is hashed using Keccak-256. If even one character is altered in the off-chain document, the computed hash will not match the on-chain fingerprint.',
    },
    {
      q: '4. How does revocation work without violating blockchain immutability?',
      a: 'In blockchain systems, historical transactions cannot be deleted. When an authorized registrar calls revokeCredential(tokenId, reason), the smart contract updates the internal state mapping _revokedTokens[tokenId] = true and emits a CredentialRevoked event. The historical proof that the degree was once issued remains immutable for audit purposes, but any verifier querying the token immediately sees that its current validity status is REVOKED.',
    },
    {
      q: '5. How does this project directly advance UN Sustainable Development Goal 4 (Quality Education)?',
      a: 'Target 4.3 aims for equal access to technical, vocational, and higher education, while Target 4.4 focuses on workforce skills. Traditional paper degrees require costly and slow manual background checks, and refugees or displaced students often lose access to university records during institutional disruptions. Soulbound decentralized credentials grant students sovereign lifetime ownership of their qualifications, enabling instant, zero-cost verification anywhere in the world.',
    },
    {
      q: '6. What are the limitations of the current prototype and future scope?',
      a: 'Current prototype limitations include reliance on public IPFS gateways and lack of zero-knowledge privacy. Future enhancements include: (1) Zero-Knowledge Proofs (e.g. proving GPA > 8.0 without disclosing full transcript), (2) W3C Decentralized Identifiers (DIDs) and Verifiable Credentials (VCs) for international standards compliance, and (3) Institutional federation for multi-university registrar consortia.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-12">
      
      {/* Page Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-rose-600" />
          <span>UN Sustainable Development Goal 4: Quality Education</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Decentralized Framework for Academic Credentials
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          Comprehensive project documentation, UN SDG 4 alignment, technical architecture, and engineering viva voce preparation guide.
        </p>
      </div>

      {/* UN SDG 4 Deep Dive */}
      <section className="bg-gradient-to-br from-rose-900 via-rose-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-rose-800 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/30 flex items-center justify-center">
            <Award className="w-7 h-7 text-rose-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold">UN Sustainable Development Goal 4 Alignment</h2>
            <p className="text-xs text-rose-200">"Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all"</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="bg-rose-900/40 p-5 rounded-2xl border border-rose-700/50">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Target 4.3</span>
            <h3 className="text-base font-bold mt-1 text-white">Equal Access to Higher Education</h3>
            <p className="text-xs text-rose-100 mt-2 leading-relaxed">
              By 2030, ensure equal access for all women and men to affordable and quality technical, vocational and tertiary education, including university.
            </p>
            <p className="text-xs text-rose-200/80 mt-3 pt-3 border-t border-rose-800/60">
              <strong>Our Contribution:</strong> Eliminates exorbitant apostille/notarization fees and administrative bottlenecks for students seeking international higher education admission.
            </p>
          </div>

          <div className="bg-rose-900/40 p-5 rounded-2xl border border-rose-700/50">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Target 4.4</span>
            <h3 className="text-base font-bold mt-1 text-white">Relevant Skills for Employment</h3>
            <p className="text-xs text-rose-100 mt-2 leading-relaxed">
              By 2030, substantially increase the number of youth and adults who have relevant skills, including technical and vocational skills, for employment and entrepreneurship.
            </p>
            <p className="text-xs text-rose-200/80 mt-3 pt-3 border-t border-rose-800/60">
              <strong>Our Contribution:</strong> Provides employers with instant, zero-cost cryptographic proof of applicant degrees, accelerating job placement and preventing resume fraud.
            </p>
          </div>
        </div>
      </section>

      {/* Core Problem vs Blockchain Solution */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Problem Analysis & Decentralized Solution</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div className="space-y-3 p-5 rounded-2xl bg-rose-50/70 border border-rose-200">
            <h3 className="font-bold text-rose-900 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Traditional Academic Credentials</span>
            </h3>
            <ul className="space-y-2 text-rose-800">
              <li>• Rampant certificate forgery (fake paper & PDFs)</li>
              <li>• Centralized university databases: single point of failure</li>
              <li>• Slow manual employer background verifications (weeks)</li>
              <li>• Administrative overhead and lost transcripts on school closure</li>
              <li>• Standard NFTs are tradable, making normal NFTs useless for degrees</li>
            </ul>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <h3 className="font-bold text-emerald-900 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>EduSoulbound Solution</span>
            </h3>
            <ul className="space-y-2 text-emerald-800">
              <li>• Cryptographic Keccak-256 fingerprinting guarantees authenticity</li>
              <li>• Decentralized EVM ledger eliminates single points of failure</li>
              <li>• Instant zero-cost verification via QR code or public portal</li>
              <li>• Permanent student wallet ownership protects against institution closure</li>
              <li>• ERC-5192 Soulbound standard permanently prevents transfers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Viva Voce Defense Guide */}
      <section className="space-y-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-edu-600">Undergraduate Project Defense</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Viva Voce Preparation & Technical Q&A</h2>
          <p className="text-xs text-slate-500 mt-1">
            Concise, technically sound explanations ready for academic viva questions.
          </p>
        </div>

        <div className="space-y-4">
          {vivaQuestions.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-start gap-2">
                <span className="w-5 h-5 rounded bg-edu-100 text-edu-700 flex items-center justify-center text-xs shrink-0 mt-0.5">Q</span>
                <span>{item.q}</span>
              </h3>
              <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
