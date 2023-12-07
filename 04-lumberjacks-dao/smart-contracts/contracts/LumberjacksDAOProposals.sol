// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IERC1155.sol";
import "./interfaces/IERC20.sol";

contract LumberjacksDAOProposals is ERC721, Ownable {
    // Proposal struct
    struct Proposal {
        string metadata_uri;
        uint256 min_power_to_vote;
        uint256 start_date;
        uint256 end_date;
        address creator;
    }
    // Vote struct
    struct Vote {
        uint256 answer;
        uint256 power;
        uint256 timestamp;
    }
    // Next token id
    uint256 private _nextTokenId;
    // Address of the attestation contract
    address public attestationContract;
    // Address of the governance contract
    address public governanceContract;
    // Mapping between proposal id and proposal
    mapping(uint256 => Proposal) public proposals;
    // Mapping between metadata uri and proposal id
    mapping(string => uint256) public proposal_id_by_metadata_uri;
    // Vote mapping: proposal_id => voter => vote
    mapping(uint256 => mapping(address => Vote)) private votes;
    // Accounts that voted for a proposal
    mapping(uint256 => address[]) private voters;
    mapping(uint256 => uint256) public attestation_nft;

    constructor(
        address initialOwner,
        address initialAttestationContract,
        address initialGovernanceContract
    ) ERC721("LumberjacksDAOProposals", "LDP") Ownable(initialOwner) {
        require(initialAttestationContract != address(0), "Invalid address");
        require(initialGovernanceContract != address(0), "Invalid address");
        attestationContract = initialAttestationContract;
        governanceContract = initialGovernanceContract;
    }

    // Returns the voting power of an account
    function votingPower(address account) public view returns (uint256) {
        uint256 balanceGovernance = IERC20(governanceContract).balanceOf(
            account
        );
        uint256 balanceAttestation = IERC1155(attestationContract).totalBalance(
            account
        );
        return (balanceGovernance / 10 ** 2) + (balanceAttestation * 2);
    }

    // Mints a new proposal
    function create(
        string memory metatada_uri,
        uint256 start_date,
        uint256 end_date,
        uint256 min_power_to_vote
    ) public {
        require(
            votingPower(msg.sender) > 0,
            "Must have voting power to mint proposal"
        );
        require(
            proposal_id_by_metadata_uri[metatada_uri] == 0,
            "Proposal already exists"
        );
        // Increase the next token id
        uint256 tokenId = _nextTokenId++;
        // Create the proposal
        proposals[tokenId].metadata_uri = metatada_uri;
        proposals[tokenId].start_date = start_date;
        proposals[tokenId].end_date = end_date;
        proposals[tokenId].min_power_to_vote = min_power_to_vote;
        proposals[tokenId].creator = msg.sender;
        proposal_id_by_metadata_uri[metatada_uri] = tokenId;
        // Mint the token
        _safeMint(msg.sender, tokenId);
    }

    // Returns the token URI
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (attestation_nft[tokenId] == 0) {
            return proposals[tokenId].metadata_uri;
        } else {
            return
                string(
                    abi.encodePacked(
                        "https://lumberjacksdao.com/attestations/",
                        attestation_nft[tokenId]
                    )
                );
        }
    }

    // Votes for a proposal
    function vote(uint256 proposal_id, uint256 answer) public {
        // Check if the proposal exists
        require(
            proposal_id_by_metadata_uri[proposals[proposal_id].metadata_uri] ==
                proposal_id,
            "Proposal does not exist"
        );
        // Check if the voter has enough voting power
        require(
            votingPower(msg.sender) >= proposals[proposal_id].min_power_to_vote,
            "Must have enough voting power to vote"
        );
        // Check if the proposal has started and has not ended
        require(
            block.timestamp >= proposals[proposal_id].start_date,
            "Proposal has not started yet"
        );
        require(
            block.timestamp <= proposals[proposal_id].end_date,
            "Proposal has ended"
        );
        // Check if the voter has already voted
        require(votes[proposal_id][msg.sender].power == 0, "Already voted");
        // Add the vote
        votes[proposal_id][msg.sender].answer = answer;
        votes[proposal_id][msg.sender].power = votingPower(msg.sender);
        votes[proposal_id][msg.sender].timestamp = block.timestamp;
        // Add the voter to the voted list
        voters[proposal_id].push(msg.sender);
        // Mint back an nft
        _nextTokenId++;
        attestation_nft[_nextTokenId] = proposal_id;
        _safeMint(msg.sender, _nextTokenId);
    }

    // Returns the votes for a proposal and address
    function getVote(
        uint256 proposal_id,
        address voter
    ) public view returns (uint256, uint256, uint256) {
        return (
            votes[proposal_id][voter].answer,
            votes[proposal_id][voter].power,
            votes[proposal_id][voter].timestamp
        );
    }

    // Return all voters for a proposal
    function getVoters(
        uint256 proposal_id
    ) public view returns (address[] memory) {
        return voters[proposal_id];
    }
}
