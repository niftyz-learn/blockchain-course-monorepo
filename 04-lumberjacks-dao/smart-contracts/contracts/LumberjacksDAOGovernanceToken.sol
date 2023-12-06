// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract LumberjacksDAOGovernanceToken is ERC20, Ownable, ERC20Permit {
    uint256 public initialPrice = 0.00001 ether;
    uint256 public priceIncreasePerToken = 0.000000001 ether;
    uint256 public initialSupply = 100 * 10 ** decimals();
    uint256 public minters = 0;
    mapping(address => bool) public isMinter;
    mapping(address => uint256) public mintedAmount;

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
        if (!isMinter[msg.sender]) {
            isMinter[msg.sender] = true;
            minters++;
        }
        mintedAmount[msg.sender] += amount;
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function getCurrentPrice() public view returns (uint256) {
        uint256 basePrice;

        // Determine base price based on whether the initial supply is exceeded
        if (initialSupply >= totalSupply()) {
            basePrice = initialPrice;
        } else {
            uint256 additionalSupply = totalSupply() - initialSupply;
            basePrice =
                initialPrice +
                (priceIncreasePerToken * additionalSupply);
        }

        // Apply a discount for first-time minters
        if (!isMinter[msg.sender]) {
            return basePrice / 10;
        }

        // Increase price based on the amount of tokens previously minted by the address
        uint256 mintedAmountBySender = mintedAmount[msg.sender];

        // Apply an increase proportional to the amount of tokens minted
        uint256 increasePercentage = mintedAmountBySender / 1000;
        uint256 increasedPrice = basePrice +
            ((basePrice * increasePercentage) / 100);

        // Decrease price proportionally to the number of minters
        uint256 decreasePercentage = minters * 1;
        uint256 finalPrice = increasedPrice -
            ((increasedPrice * decreasePercentage) / 100);

        return finalPrice;
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
