// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DeFund
 * @notice AI-Verified, Agent-Controlled Crowdfunding on Monad
 * @dev Autonomous escrow with multi-agent verification - no human fund control
 */
contract DeFund is ReentrancyGuard {
    
    // ============ Enums ============
    enum CampaignState { ACTIVE, COMPLETED, FAILED }
    enum MilestoneState { PENDING, SUBMITTED, PASSED, FAILED }
    
    // ============ Structs ============
    struct Milestone {
        string description;
        uint256 fundsAllocated;
        string proofUrl;
        MilestoneState state;
        uint8 confidence;
    }
    
    struct Campaign {
        address creator;
        string title;
        string description;
        uint256 fundingGoal;
        uint256 raisedAmount;
        uint256 releasedAmount;
        CampaignState state;
        uint256 milestoneCount;
        uint256 currentMilestone;
        uint256 createdAt;
    }
    
    // ============ State Variables ============
    uint256 public campaignCounter;
    address public verifier; // Backend orchestrator address
    
    mapping(uint256 => Campaign) public campaigns;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => mapping(address => uint256)) public contributions;
    mapping(uint256 => address[]) public backers;
    
    // ============ Events ============
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string title,
        uint256 fundingGoal,
        uint256 milestoneCount
    );
    
    event ContributionReceived(
        uint256 indexed campaignId,
        address indexed backer,
        uint256 amount,
        uint256 totalRaised
    );
    
    event MilestoneSubmitted(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        string proofUrl
    );
    
    event MilestoneVerified(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        bool passed,
        uint8 confidence
    );
    
    event FundsReleased(
        uint256 indexed campaignId,
        uint256 indexed milestoneIndex,
        address indexed creator,
        uint256 amount
    );
    
    event RefundClaimed(
        uint256 indexed campaignId,
        address indexed backer,
        uint256 amount
    );
    
    event CampaignCompleted(uint256 indexed campaignId);
    event CampaignFailed(uint256 indexed campaignId);
    
    // ============ Modifiers ============
    modifier onlyVerifier() {
        require(msg.sender == verifier, "Only verifier can call");
        _;
    }
    
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId < campaignCounter, "Campaign does not exist");
        _;
    }
    
    // ============ Constructor ============
    constructor(address _verifier) {
        verifier = _verifier;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Create a new crowdfunding campaign with milestones
     * @param _title Campaign title
     * @param _description Campaign description
     * @param _fundingGoal Total funding goal in wei
     * @param _milestoneDescriptions Array of milestone descriptions
     * @param _milestoneAllocations Array of fund allocations per milestone (must sum to 100%)
     */
    function createCampaign(
        string calldata _title,
        string calldata _description,
        uint256 _fundingGoal,
        string[] calldata _milestoneDescriptions,
        uint256[] calldata _milestoneAllocations
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_fundingGoal > 0, "Goal must be > 0");
        require(_milestoneDescriptions.length > 0, "Need at least 1 milestone");
        require(_milestoneDescriptions.length == _milestoneAllocations.length, "Mismatched arrays");
        
        // Verify allocations sum to 100
        uint256 totalAllocation;
        for (uint256 i = 0; i < _milestoneAllocations.length; i++) {
            totalAllocation += _milestoneAllocations[i];
        }
        require(totalAllocation == 100, "Allocations must sum to 100");
        
        uint256 campaignId = campaignCounter++;
        
        campaigns[campaignId] = Campaign({
            creator: msg.sender,
            title: _title,
            description: _description,
            fundingGoal: _fundingGoal,
            raisedAmount: 0,
            releasedAmount: 0,
            state: CampaignState.ACTIVE,
            milestoneCount: _milestoneDescriptions.length,
            currentMilestone: 0,
            createdAt: block.timestamp
        });
        
        // Create milestones
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            uint256 allocation = (_fundingGoal * _milestoneAllocations[i]) / 100;
            milestones[campaignId][i] = Milestone({
                description: _milestoneDescriptions[i],
                fundsAllocated: allocation,
                proofUrl: "",
                state: MilestoneState.PENDING,
                confidence: 0
            });
        }
        
        emit CampaignCreated(
            campaignId,
            msg.sender,
            _title,
            _fundingGoal,
            _milestoneDescriptions.length
        );
        
        return campaignId;
    }
    
    /**
     * @notice Contribute funds to a campaign
     * @param _campaignId The campaign to fund
     */
    function contribute(uint256 _campaignId) 
        external 
        payable 
        campaignExists(_campaignId) 
        nonReentrant 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.state == CampaignState.ACTIVE, "Campaign not active");
        require(msg.value > 0, "Must send funds");
        
        // Track if new backer
        if (contributions[_campaignId][msg.sender] == 0) {
            backers[_campaignId].push(msg.sender);
        }
        
        contributions[_campaignId][msg.sender] += msg.value;
        campaign.raisedAmount += msg.value;
        
        emit ContributionReceived(
            _campaignId,
            msg.sender,
            msg.value,
            campaign.raisedAmount
        );
    }
    
    /**
     * @notice Creator submits proof for current milestone
     * @param _campaignId Campaign ID
     * @param _proofUrl URL to proof (GitHub, video, etc.)
     */
    function submitMilestone(
        uint256 _campaignId,
        string calldata _proofUrl
    ) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.creator, "Only creator can submit");
        require(campaign.state == CampaignState.ACTIVE, "Campaign not active");
        require(campaign.raisedAmount > 0, "No funds raised yet");
        
        uint256 milestoneIndex = campaign.currentMilestone;
        require(milestoneIndex < campaign.milestoneCount, "All milestones completed");
        
        Milestone storage milestone = milestones[_campaignId][milestoneIndex];
        require(milestone.state == MilestoneState.PENDING, "Already submitted");
        require(bytes(_proofUrl).length > 0, "Proof URL required");
        
        milestone.proofUrl = _proofUrl;
        milestone.state = MilestoneState.SUBMITTED;
        
        emit MilestoneSubmitted(_campaignId, milestoneIndex, _proofUrl);
    }
    
    /**
     * @notice AI Verifier records verification result (called by backend)
     * @param _campaignId Campaign ID
     * @param _milestoneIndex Milestone index
     * @param _passed Whether the milestone passed verification
     * @param _confidence Confidence score (0-100)
     */
    function verifyMilestone(
        uint256 _campaignId,
        uint256 _milestoneIndex,
        bool _passed,
        uint8 _confidence
    ) external onlyVerifier campaignExists(_campaignId) nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.state == CampaignState.ACTIVE, "Campaign not active");
        require(_milestoneIndex == campaign.currentMilestone, "Wrong milestone");
        
        Milestone storage milestone = milestones[_campaignId][_milestoneIndex];
        require(milestone.state == MilestoneState.SUBMITTED, "Not submitted");
        
        milestone.confidence = _confidence;
        
        if (_passed) {
            milestone.state = MilestoneState.PASSED;
            
            // Release funds for this milestone
            uint256 releaseAmount = milestone.fundsAllocated;
            if (releaseAmount > campaign.raisedAmount - campaign.releasedAmount) {
                releaseAmount = campaign.raisedAmount - campaign.releasedAmount;
            }
            
            campaign.releasedAmount += releaseAmount;
            campaign.currentMilestone++;
            
            // Transfer funds to creator
            (bool success, ) = payable(campaign.creator).call{value: releaseAmount}("");
            require(success, "Transfer failed");
            
            emit MilestoneVerified(_campaignId, _milestoneIndex, true, _confidence);
            emit FundsReleased(_campaignId, _milestoneIndex, campaign.creator, releaseAmount);
            
            // Check if all milestones completed
            if (campaign.currentMilestone >= campaign.milestoneCount) {
                campaign.state = CampaignState.COMPLETED;
                emit CampaignCompleted(_campaignId);
            }
        } else {
            milestone.state = MilestoneState.FAILED;
            campaign.state = CampaignState.FAILED;
            
            emit MilestoneVerified(_campaignId, _milestoneIndex, false, _confidence);
            emit CampaignFailed(_campaignId);
        }
    }
    
    /**
     * @notice Backer claims refund from failed campaign
     * @param _campaignId Campaign ID
     */
    function claimRefund(uint256 _campaignId) 
        external 
        campaignExists(_campaignId) 
        nonReentrant 
    {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.state == CampaignState.FAILED, "Campaign not failed");
        
        uint256 contribution = contributions[_campaignId][msg.sender];
        require(contribution > 0, "No contribution found");
        
        // Calculate refund based on unreleased funds
        uint256 unreleasedFunds = campaign.raisedAmount - campaign.releasedAmount;
        uint256 totalContributions = campaign.raisedAmount;
        uint256 refundAmount = (contribution * unreleasedFunds) / totalContributions;
        
        require(refundAmount > 0, "No refund available");
        
        // Clear contribution before transfer
        contributions[_campaignId][msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");
        
        emit RefundClaimed(_campaignId, msg.sender, refundAmount);
    }
    
    // ============ View Functions ============
    
    function getCampaign(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId)
        returns (Campaign memory) 
    {
        return campaigns[_campaignId];
    }
    
    function getMilestone(uint256 _campaignId, uint256 _milestoneIndex)
        external
        view
        campaignExists(_campaignId)
        returns (Milestone memory)
    {
        require(_milestoneIndex < campaigns[_campaignId].milestoneCount, "Invalid milestone");
        return milestones[_campaignId][_milestoneIndex];
    }
    
    function getContribution(uint256 _campaignId, address _backer)
        external
        view
        returns (uint256)
    {
        return contributions[_campaignId][_backer];
    }
    
    function getBackerCount(uint256 _campaignId)
        external
        view
        campaignExists(_campaignId)
        returns (uint256)
    {
        return backers[_campaignId].length;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Allow updating verifier (for testing/demo purposes)
    function setVerifier(address _newVerifier) external onlyVerifier {
        verifier = _newVerifier;
    }
}
