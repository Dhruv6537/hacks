________________________________________
DESIGN DOCUMENT – DeFund Application UI (Alpha-Style Theme)
Purpose: Full multi-page decentralized crowdfunding app with a premium trading-platform aesthetic.
________________________________________
1. Global Visual Style (Design System)
1.1 Theme Identity
•	Dark futuristic fintech UI
•	Neon green as primary accent
•	Glassmorphic panels
•	Soft shadows and 3D depth
•	Rounded containers everywhere (not sharp Web3 boxes)
This should feel like a prop trading platform or AI fintech product, not a crypto dashboard template.
________________________________________
1.2 Core Colors
Role	Color
Background	#0B0F0C (deep black-green)
Primary Accent	#B6F35C (neon green)
Secondary Accent	#4ADE80
Text Primary	#FFFFFF
Text Secondary	#9CA3AF
Glass Panels	rgba(255,255,255,0.05)
Border Glow	rgba(182,243,92,0.4)
________________________________________
1.3 Typography
•	Headings: Space Grotesk / Satoshi / Inter
•	Numbers: Monospace for financial data
•	Big bold hero fonts with tight tracking (like trading platforms)
________________________________________
2. Global Layout Architecture
2.1 App Shell Layout
Light outer frame (optional)
→ Dark rounded app container
   ├── Top Navigation Bar
   ├── Left Sidebar (optional for app mode)
   └── Main Content Panel (glass cards)
Core Concept
Everything sits inside a rounded dark “app card” floating on a light background.
________________________________________
3. Top Navigation Bar (Persistent Across Pages)
Left
•	Logo icon (neon green abstract)
•	Brand text: DeFund
Center (Glass Pill Menu)
•	Dashboard
•	Campaigns
•	Create Campaign
•	Verifications
•	Refunds
Right
•	Wallet Connect Button (neon green glow)
•	Network Badge: “Monad Testnet”
________________________________________
4. Page-Level Design Specs
________________________________________
4.1 Dashboard Page
Hero Header Section (Alpha-style)
Large bold heading with neon highlight:
“AI-Verified Crowdfunding on Monad”
“Trustless Funding with Autonomous Escrow” (green highlight)
Below:
•	Short description text in grey
•	Primary CTA button: Create Campaign
•	Secondary button: Explore Campaigns
________________________________________
Metric Cards Section
Glass cards with neon icons:
•	Total Funds Locked
•	Active Campaigns
•	AI Verifications Today
•	Refunds Triggered
Cards must:
•	Glow slightly on hover
•	Use big trading-style numbers
________________________________________
Live AI Activity Panel
Right side floating glass panel:
•	Recent AI milestone decisions
•	Agent votes with neon badges
•	PASS / FAIL states
________________________________________
4.2 Campaigns Explorer Page
Layout
Grid of glass campaign cards.
Each card:
•	Campaign Title
•	Funding progress bar (neon gradient)
•	Creator address
•	Status badge (Active / Verifying / Failed)
•	“View Details” button
________________________________________
4.3 Campaign Detail Page
Hero Banner (Alpha Style)
Large campaign name in bold
Funding progress bar with glow
Stats row:
•	Goal
•	Raised
•	Backers
•	Next Milestone
________________________________________
Milestone Timeline Panel
Glass vertical cards:
Milestone 1 → PASSED
Milestone 2 → VERIFYING
Milestone 3 → PENDING
Each milestone card shows:
•	Proof URL
•	AI reasoning expandable panel
•	Confidence scores
________________________________________
Backer Action Panel
Glass sidebar:
•	Contribute button
•	Claim Refund (only enabled if failed)
•	Transaction history list
________________________________________
4.4 Create Campaign Page
Hero Header
Big title like trading UI:
“Launch a Trustless Campaign”
________________________________________
Glass Form Panel
Fields:
•	Project Title
•	Description
•	Funding Goal
•	Milestones (dynamic list with % allocation)
Primary neon button: Deploy Campaign on Monad
________________________________________
4.5 Verification Transparency Page
AI Consensus Dashboard
Large center panel showing:
Agent | Vote | Confidence
GPT | PASS | 87%
Claude | PASS | 91%
Gemini | FAIL | 62%
Final Decision Badge: PASS (2/3)
Animated neon bars for confidence.
________________________________________
4.6 Refunds Page
Glass table listing:
•	Campaign
•	Amount refundable
•	Claim button
•	Tx hash
________________________________________
5. Glassmorphism Component Style
All panels must use:
•	backdrop-blur-xl
•	bg-white/5
•	Rounded 20–28px
•	Subtle neon border glow on hover
•	Soft shadow depth
This matches the Alpha trading UI feel.
________________________________________
6. 3D / Depth Visual Elements
To match the screenshot vibe:
•	Floating crypto icons (SVG or PNG)
•	Soft blurred background shapes
•	Subtle gradient or spotlight behind hero text
•	Animated neon particles (optional)
These are decorative, not functional.
________________________________________
7. Interaction Design Language
Blockchain Actions
•	Pending → blurred glass with spinner
•	Confirmed → neon green glow
•	Failed → red glow
________________________________________
AI Decisions
•	PASS → green neon badge
•	FAIL → red neon badge
•	Verifying → yellow pulse animation
________________________________________
8. Layout Grid System
•	Max width: 1200–1400px centered
•	Inner padding: 24–40px
•	Card grid: 3–4 columns desktop
•	Stacked on mobile
________________________________________
9. Component Tree (LLM Must Generate)
Global
•	AppShell
•	TopNavbar
•	Sidebar
Pages
•	DashboardPage
•	CampaignExplorerPage
•	CampaignDetailPage
•	CreateCampaignPage
•	VerificationPage
•	RefundPage
Components
•	GlassCard
•	NeonButton
•	MetricCard
•	CampaignCard
•	MilestoneCard
•	AgentConsensusPanel
•	TxLink
________________________________________
10. UX Storytelling Requirement
The UI must visually communicate:
•	This is a high-end financial protocol
•	AI is actively making decisions
•	Money is locked and enforced by code
•	Monad is powering real-time finance
This is prop trading UI aesthetics applied to decentralized crowdfunding.
________________________________________
11. Tailwind Design Tokens (for Opus)
--bg-main: #0B0F0C
--accent-neon: #B6F35C
--glass-bg: rgba(255,255,255,0.05)
--radius-xl: 24px
--glow: 0 0 20px rgba(182,243,92,0.4)
________________________________________
12. LLM Implementation Directive
Claude Opus must:
•	Use dark rounded container framing
•	Apply glassmorphism to all panels
•	Use neon green as primary accent
•	Build multi-page app, not single landing page
•	Use trading-platform typography and layout density
•	Avoid generic crypto dashboard UI templates



Sample image
 
