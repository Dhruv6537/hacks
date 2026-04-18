PRD – DeFund
AI-Verified, Agent-Controlled Crowdfunding Infrastructure on Monad
________________________________________
1. System Identity
Product Name: DeFund
Category: Decentralized AI Infrastructure + Crowdfunding Protocol
Core Paradigm: Agent-controlled finance (x402 model)
Execution Layer: Monad Blockchain (mandatory)
Control Layer: Multi-agent AI verification
Settlement Layer: Smart contracts (autonomous escrow)
________________________________________
2. Mandatory Deployment Constraint (Hackathon Rule)
Hard Requirement
All contracts, transactions, and escrow logic must be deployed on Monad blockchain.
Non-Negotiable Constraints:
•	Network: Monad testnet/mainnet only
•	No Ethereum, no Polygon, no Solana, no EVM sidechains
•	Contracts must use Monad-compatible tooling
•	Final demo must include:
o	Live deployed contract address on Monad
o	Monad explorer links
o	Real transactions
o	Real escrow flow
o	Real fund movement
Reason: Monad is the sponsor chain → deployment is a qualification condition, not a feature.
________________________________________
3. Product Definition
What DeFund Is
DeFund is an autonomous crowdfunding protocol where:
•	Funds are controlled by smart contracts
•	Verification is done by AI agents
•	Decisions are made by multi-agent consensus
•	Execution is done by on-chain logic
•	Humans do not approve or release funds
This is not Web3 crowdfunding.
This is machine-enforced accountability infrastructure.
________________________________________
4. Core Problem Model
Systemic Failures in Traditional Crowdfunding
1.	Funds are transferred immediately
2.	No escrow enforcement
3.	No automated verification
4.	No programmable accountability
5.	No execution guarantees
6.	No trust enforcement layer
Root Cause
Platforms are payment routers, not accountability systems.
________________________________________
5. System Philosophy
“Trust must be enforced by code, not belief.”
DeFund replaces:
•	Human trust → AI verification
•	Platform authority → Smart contracts
•	Manual disputes → Autonomous execution
•	Central moderation → Agent consensus
________________________________________
6. Functional Scope
Actors (System-Level)
1.	Human Actors
o	Creator
o	Backer
2.	Software Actors
o	AI Verifier Agents
o	Backend Orchestrator Agent
o	Smart Contract (Autonomous Executor)
________________________________________
7. High-Level Architecture
Human UI Layer
   ↓
React Frontend
   ↓
Backend Orchestrator (Node.js)
   ↓
AI Agent Layer (Multi-model consensus)
   ↓
Smart Contract Layer (Monad)
   ↓
Autonomous Fund Execution
________________________________________
8. Core System Modules
8.1 Campaign Module
Purpose:
Create verifiable funding structures with enforceable milestones.
Data Model:
•	campaignId
•	creatorAddress
•	fundingGoal
•	raisedAmount
•	milestones[]
o	description
o	verificationType (code/video/mixed)
o	fundsAllocated
o	status (pending/passed/failed)
•	escrowBalance
•	state (active/completed/failed)
________________________________________
8.2 Escrow Module (On-Chain)
Purpose:
Funds are never owned by the platform or creator until conditions are met.
Rules:
•	Funds locked in contract
•	Funds cannot be withdrawn manually
•	Only contract logic can move funds
•	AI verification is required for release
•	Failure enables refund path
________________________________________
8.3 AI Verification Module
Purpose:
Replace human verification with autonomous software agents.
Inputs:
•	Proof URL
•	Milestone description
•	Expected deliverables
Processing:
•	Fetch data
•	Preprocess data
•	Normalize data
•	Distribute to agents
•	Collect responses
•	Aggregate consensus
Outputs:
{
  "passed": true,
  "confidence": 87,
  "agentVotes": [
    { "agent": "GPT", "vote": true, "confidence": 85 },
    { "agent": "Claude", "vote": true, "confidence": 90 },
    { "agent": "Gemini", "vote": false, "confidence": 60 }
  ],
  "finalDecision": "PASS"
}
________________________________________
8.4 Consensus Engine
Rule System:
•	3 agents minimum
•	2/3 majority required
•	Weighted by confidence
•	Deterministic aggregation logic
No human override exists.
________________________________________
8.5 Smart Contract Execution Layer
Role:
•	Final authority
•	Enforces escrow rules
•	Executes payments
•	Enables refunds
•	Emits state events
AI agents do not move funds directly.
They trigger contract logic.
________________________________________
9. Mandatory Technical Flow (End-to-End)
Campaign Creation
UI → ethers.js → Monad Contract
→ createCampaign()
→ On-chain storage
→ Event emitted
→ UI sync
________________________________________
Contribution Flow
UI → contribute(campaignId, value)
→ MON transferred to escrow
→ Contract stores funds
→ Event emitted
→ UI updates funding progress
________________________________________
Milestone Verification Flow
Creator submits proof URL
→ Frontend POST /verify-milestone
→ Backend fetches proof
→ AI agents analyze
→ Consensus engine aggregates
→ Backend calls verifyMilestone()
→ Monad contract executes
________________________________________
Fund Release
If PASS:
→ releaseFunds()
→ MON transferred to creator
→ State updated on-chain
________________________________________
Refund Flow
If FAIL:
→ refundsEnabled = true
→ Backers call claimRefund()
→ Contract transfers funds back
________________________________________
10. Smart Contract Requirements (Monad)
Mandatory Properties
•	Monad-compatible Solidity
•	Low-gas design
•	Event-driven architecture
•	Deterministic state machine
•	No admin override
•	No manual withdraw functions
•	No owner-controlled release
•	No emergency drain functions
________________________________________
11. Core Contract Logic
State Machine
CREATED → FUNDED → VERIFYING → PASSED → RELEASED
                      ↓
                    FAILED → REFUNDING → REFUNDED
________________________________________
12. Agent Economy Model (x402 Compliance)
Agents as Economic Actors
Agents:
•	Earn fees per verification
•	Build reputation
•	Lose reputation for false calls
•	Compete for verification jobs
Economic Logic:
•	Verification fee paid by contract
•	Reputation stored off-chain (MVP)
•	Future on-chain staking model planned
________________________________________
13. x402 Alignment Model
Component	Role
AI Agents	Primary decision-makers
Smart Contract	Autonomous budget manager
Blockchain	Payment rail
Humans	UI-level actors only
Software controls money. Humans do not.
________________________________________
14. Monad-Specific Design Advantages
•	1s finality enables real-time verification UX
•	Sub-cent fees enable AI microtransactions
•	High TPS supports agent economy
•	Low latency enables real-time agent consensus
•	Makes AI-to-contract execution economically viable
________________________________________
15. Non-Functional Requirements
Performance
•	Sub-second confirmations
•	Parallel AI calls
•	Async verification
•	Event-based UI updates
Security
•	No admin keys
•	No upgradeable proxy
•	No centralized fund custody
•	Immutable logic
Reliability
•	Deterministic contract logic
•	Fallback refund paths
•	State recovery via chain data
________________________________________
16. Explicit MVP Constraints
Included
•	Centralized backend
•	API-based AI agents
•	Manual model keys
•	Simplified reputation
•	Basic milestone structure
•	GitHub + video verification
Excluded
•	DAO governance
•	On-chain reputation
•	zk proofs
•	decentralized inference
•	decentralized storage
•	staking economics
•	arbitration courts
________________________________________
17. System Boundaries
DeFund is not:
•	A social platform
•	A marketplace
•	A DAO tool
•	A payment app
•	A token project
DeFund is:
•	Autonomous verification infrastructure
•	AI-controlled escrow protocol
•	Agent economy demonstration system
•	x402 reference architecture
•	Monad-native AI-finance stack
________________________________________
18. LLM Implementation Guidance (for Opus 4.5)
The system must be generated as:
•	Modular architecture
•	Contract-first design
•	Event-driven logic
•	Agent-first control model
•	Monad-native deployment
•	Escrow-enforced flows
•	AI as decision layer
•	Contracts as execution layer
________________________________________
19. Definition of Done (Hackathon Criteria)
Project is complete when:
•	Smart contract deployed on Monad
•	Real escrow working
•	AI verification triggers contract logic
•	Multi-agent consensus implemented
•	Funds auto-release on pass
•	Refunds work on fail
•	Explorer links visible
•	Fully autonomous demo flow works
•	No manual admin actions needed
________________________________________
20. System Identity Statement
DeFund is not a crowdfunding app.
It is machine-enforced trust infrastructure.
AI decides.
Code executes.
Blockchain settles.
Humans observe.

