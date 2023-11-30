// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract LumberjacksDAOGovernanceToken is ERC20, Ownable, ERC20Permit {
    constructor(
        address initialOwner
    )
        ERC20("LumberjacksDAOGovernanceToken", "LDGT")
        Ownable(initialOwner)
        ERC20Permit("LumberjacksDAOGovernanceToken")
    {
        _mint(msg.sender, 100000 * 10 ** decimals());
    }

    function mint(address to) public payable {
        require(msg.value >= 0.1 ether, "Minting requires 0.1 ether");
        uint256 amount = msg.value * 10000 ether;
        _mint(to, amount);
    }

    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "No balance to withdraw");
        payable(owner()).transfer(address(this).balance);
    }
}
