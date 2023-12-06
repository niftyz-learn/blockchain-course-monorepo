// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

contract LumberjacksDAOAttestations is ERC1155, Ownable, ERC1155Supply {
    event Prepared(
        uint256 indexed event_id,
        string metadata_uri,
        uint256 max_tokens,
        address indexed creator
    );
    event Minted(uint256 indexed event_id, address indexed account);

    struct Event {
        string metadata_uri;
        uint256 max_tokens;
        uint256 minted_tokens;
        address creator;
    }

    mapping(uint256 => Event) public events;
    uint256 public event_count;
    mapping(address => mapping(uint256 => bool)) public received;
    mapping(string => uint256) public event_id_by_metadata_uri;

    constructor(
        address initialOwner
    ) ERC1155("https://pointtoattestation.link/{id}") Ownable(initialOwner) {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    /**
     * metadata_uri: IPFS string that points to metadata json file
     * max_tokens: Max amount of tokens that can be minted for this event
     */
    function prepare(
        string memory metadata_uri,
        uint256 max_tokens
    ) public returns (uint256) {
        require(max_tokens > 0, "Max tokens must be greater than 0");
        require(event_id_by_metadata_uri[metadata_uri] == 0, "Event already exists");
        // Event id is current counter
        uint256 event_id = event_count;
        // Create the event mapping
        events[event_id].metadata_uri = metadata_uri;
        events[event_id].max_tokens = max_tokens;
        events[event_id].creator = msg.sender;
        events[event_id].minted_tokens = 0;
        // Create the mapping between the metadata uri and the event id
        event_id_by_metadata_uri[metadata_uri] = event_id;
        // Increase event counter to prepare for next event
        event_count += 1;
        // Emit the event
        emit Prepared(event_id, metadata_uri, max_tokens, msg.sender);
        // Return the event id
        return event_id;
    }

    function mint(address account, uint256 id) public {
        require(events[id].max_tokens > 0, "Event does not exist");
        require(!received[account][id], "Already received");
        require(
            events[id].minted_tokens < events[id].max_tokens,
            "Max tokens minted"
        );
        // Add the receiving mapping
        received[account][id] = true;
        // Increase the minted tokens counter
        events[id].minted_tokens += 1;
        // Emit the event
        emit Minted(id, account);
        // Finally mint the NFT
        _mint(account, id, 1, bytes(""));
    }

    function mintBatch(address[] memory to, uint256 id) public {
        require(events[id].max_tokens > 0, "Event does not exist");
        require(to.length <= 50, "No recipients");
        require(
            events[id].minted_tokens + to.length < events[id].max_tokens,
            "Max tokens minted"
        );
        for (uint256 i = 0; i < to.length; i++) {
            require(!received[to[i]][id], "Already received");
            // Add the receiving mapping
            received[to[i]][id] = true;
            // Increase the minted tokens counter
            events[id].minted_tokens += 1;
            // Emit the event
            emit Minted(id, to[i]);
            // Finally mint the NFT
            _mint(to[i], id, 1, bytes(""));
        }
    }

    function totalBalance(address account) public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < event_count; i++) {
            if (received[account][i]) {
                total += balanceOf(account, i);
            }
        }
        return total;
    }

    // The following functions are overrides required by Solidity.
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
