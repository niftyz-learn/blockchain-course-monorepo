// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract LumberjacksDAOGovernanceToken is ERC20, Ownable, ERC20Permit {
    uint256 public initialPrice = 0.00001 ether;
    uint256 public priceIncreasePerToken = 0.000000001 ether;
    uint256 public initialSupply = 100 * 10 ** decimals();

    constructor(
        address initialOwner
    )
        ERC20("LumberjacksDAOGovernanceToken", "LDGT")
        Ownable(initialOwner)
        ERC20Permit("LumberjacksDAOGovernanceToken")
    {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) public payable {
        uint256 currentPrice = getCurrentPrice();
        require(msg.value >= amount * currentPrice, "Ether sent is not enough");
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function getCurrentPrice() public view returns (uint256) {
        if (initialSupply >= totalSupply()) {
            return initialPrice;
        } else {
            uint256 additionalSupply = totalSupply() - initialSupply;
            return initialPrice + (priceIncreasePerToken * additionalSupply);
        }
    }

    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "No balance to withdraw");
        payable(owner()).transfer(address(this).balance);
    }

    function calculateTokenAmount(
        uint256 ethAmount
    ) public view returns (uint256) {
        uint256 currentPrice = getCurrentPrice();
        return ethAmount / currentPrice;
    }

    function decimals() public view virtual override returns (uint8) {
        return 2;
    }
}
