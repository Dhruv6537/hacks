TECH STACK DOCUMENT – DeFund (Monad Hackathon)
LLM-Executable Engineering Specification
________________________________________
1. System-Level Technology Philosophy
DeFund must be built as a contract-first, agent-controlled, event-driven system deployed on Monad.
Key Principles:
•	Smart contracts are the execution authority
•	AI agents are the decision authority
•	Backend is orchestration only (MVP constraint)
•	Frontend is a visualization and interaction layer
•	Monad is the only blockchain target
________________________________________
2. Blockchain Layer (Mandatory)
2.1 Network
•	Monad Testnet / Mainnet (MANDATORY)
•	No Ethereum, no Polygon, no Solana, no Arbitrum
•	Deployment must produce:
o	Contract address
o	Transaction hash
o	Explorer link
________________________________________
2.2 Smart Contract Language
•	Solidity (Monad-compatible)
•	Version: ^0.8.20 or Monad recommended compiler version
________________________________________
2.3 Smart Contract Framework
•	Foundry (Preferred) or Hardhat
•	Must support Monad RPC endpoints
________________________________________
2.4 Contract Libraries
•	OpenZeppelin (only for basic utilities)
o	ReentrancyGuard
o	SafeMath (optional in 0.8+)
o	Ownable NOT allowed for fund control
________________________________________
2.5 Wallet & Signing
•	MetaMask (Monad configured RPC)
•	ethers.js v6 (frontend + backend)
________________________________________
3. AI Agent Layer
3.1 AI Models (MVP)
Multi-Agent Voting Models:
•	OpenAI GPT-4 / GPT-4.1
•	Anthropic Claude
•	Google Gemini
In hackathon, simulated agents allowed but multi-agent architecture must exist.
________________________________________
3.2 Agent Execution Pattern
•	Parallel API calls
•	Deterministic aggregation logic
•	Confidence-weighted voting
•	No human override
________________________________________
3.3 Agent Output Schema
{
  "passed": true,
  "confidence": 0-100,
  "reasoning": "string",
  "agent_id": "GPT|Claude|Gemini"
}
________________________________________
4. Backend Orchestrator Layer
4.1 Runtime
•	Node.js 18+
•	TypeScript preferred
________________________________________
4.2 Framework
•	Express.js (REST API)
________________________________________
4.3 Responsibilities
•	Proof fetching (GitHub, video)
•	AI API calls
•	Consensus aggregation
•	Smart contract interaction
•	Rate limiting
•	API key protection
________________________________________
4.4 Blockchain SDK
•	ethers.js v6
•	Monad RPC endpoint configured via .env
________________________________________
4.5 Proof Fetching APIs
•	GitHub REST API
•	Video frame extraction (ffmpeg or external API)
•	HTTP fetch for URLs
________________________________________
5. Frontend Layer
5.1 Framework
•	React 18
•	Vite (mandatory)
•	TypeScript
________________________________________
5.2 Styling
•	TailwindCSS
•	ShadCN UI optional
________________________________________
5.3 Blockchain Interaction
•	ethers.js v6
•	MetaMask provider
•	Monad RPC config
________________________________________
5.4 UI Components
•	Campaign creation form
•	Campaign list dashboard
•	Contribution modal
•	Milestone submission UI
•	AI verification logs panel
•	Transaction explorer links
•	Refund claim UI
________________________________________
6. Storage Layer
6.1 On-Chain Storage
•	Campaign metadata (minimal)
•	Milestone state
•	Escrow balances
•	Verification status
________________________________________
6.2 Off-Chain Storage (MVP)
•	Proof URLs stored in DB or JSON
•	AI logs stored in backend memory or DB
•	No IPFS required (optional bonus)
________________________________________
6.3 Database
•	SQLite or MongoDB (optional)
•	Hackathon acceptable: in-memory store
________________________________________
7. DevOps & Deployment
7.1 Smart Contracts
•	Deploy via:
o	Foundry scripts
o	Hardhat deploy scripts
•	Must print contract address and tx hash
________________________________________
7.2 Backend Hosting
•	Railway / Render / Vercel Serverless
•	Local demo acceptable but cloud preferred
________________________________________
7.3 Frontend Hosting
•	Vercel / Netlify / GitHub Pages
________________________________________
8. Repo Structure (LLM Must Generate)
defund/
│
├── contracts/
│   ├── DeFund.sol
│   ├── CampaignEscrow.sol
│   └── interfaces/
│
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── verify.ts
│   │   ├── aiAgents/
│   │   ├── consensus/
│   │   └── chain/
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── contract/
│   │   └── App.tsx
│   └── vite.config.ts
│
├── scripts/
│   ├── deployMonad.ts
│   └── verify.ts
│
└── README.md
________________________________________
9. Smart Contract Technical Requirements
9.1 Mandatory Functions
•	createCampaign()
•	contribute()
•	submitMilestone()
•	verifyMilestone()
•	releaseFunds()
•	claimRefund()
________________________________________
9.2 Mandatory Events
•	CampaignCreated
•	ContributionReceived
•	MilestoneSubmitted
•	MilestoneVerified
•	FundsReleased
•	RefundClaimed
________________________________________
9.3 Forbidden Patterns
•	No owner withdraw()
•	No admin override fund release
•	No upgradeable proxies
•	No emergency drain
•	No centralized custody keys
________________________________________
10. Consensus Engine Implementation
Aggregation Logic
•	Minimum 3 agents
•	Pass if ≥ 2 agents vote true
•	Weighted by confidence (optional)
________________________________________
Reference Pseudocode
const passed = votes.filter(v => v.vote).length >= 2;
________________________________________
11. Monad Integration Requirements
11.1 RPC
•	Monad RPC endpoint in .env
•	Chain ID configured in MetaMask
________________________________________
11.2 Explorer Integration
•	Frontend must show:
o	Transaction hash
o	Monad explorer link
________________________________________
11.3 Performance UX
•	UI must highlight:
o	1s finality
o	Instant milestone verification UX
________________________________________
12. Security Constraints
Backend
•	API keys in .env
•	No secrets in frontend
•	Rate limiting enabled
________________________________________
Contracts
•	Reentrancy guard on refunds
•	Checks-effects-interactions pattern
•	No external call loops
________________________________________
13. Non-Functional Constraints
Performance
•	Parallel AI calls
•	Async blockchain calls
•	Event-driven UI refresh
Reliability
•	Contract as single source of truth
•	Backend stateless where possible
Observability
•	Console logs for AI decisions
•	Event logs for blockchain actions
________________________________________
14. Hackathon Demo Mode Requirements
Must demonstrate:
1.	Live Monad contract deployed
2.	Real MON test tokens escrowed
3.	AI verification triggers contract call
4.	Funds auto-released or refunded
5.	Monad explorer link shown
6.	Multi-agent voting visible in UI
________________________________________
15. Future Stack (Explicitly Out of Scope)
These must NOT be implemented for MVP:
•	zkML verification
•	On-chain AI inference
•	Fully decentralized agent nodes
•	DAO governance
•	Token issuance
•	Creator staking
•	Slashing economics
(Only mention in roadmap, not implement.)
________________________________________
16. LLM Implementation Mode for Opus 4.5
Claude Opus must treat this system as:
•	Contract-first architecture
•	Agent-controlled logic flow
•	Monad-native deployment target
•	Modular monorepo project
•	TypeScript-first codebase
•	Event-driven UI
•	Deterministic consensus logic
________________________________________
17. Tech Stack Summary Table
Layer	Tech
Blockchain	Monad
Contracts	Solidity
Contract Tooling	Foundry / Hardhat
Frontend	React + Vite + TypeScript
Styling	TailwindCSS
Wallet	MetaMask
Chain SDK	ethers.js v6
Backend	Node.js + Express
AI Agents	GPT + Claude + Gemini
Hosting	Vercel / Railway
________________________________________
18. Identity Statement for Judges
This stack is designed to prove AI agents can autonomously control capital on Monad with real escrow enforcement and zero human fund release authority.
#Note: will be only using gemini for api key and not any other/extra
