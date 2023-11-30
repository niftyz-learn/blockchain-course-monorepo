// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract LumberjacksDAOGovernanceToken is ERC20, Ownable, ERC20Permit {
    constructor(address initialOwner)
        ERC20("LumberjacksDAOGovernanceToken", "LDGT")
        Ownable(initialOwner)
        ERC20Permit("LumberjacksDAOGovernanceToken")
    {
        _mint(msg.sender, 100000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}