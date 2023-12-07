const { ethers, utils } = require("ethers");
const fs = require('fs');
const { derive } = require('../../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const { keys } = await derive(configs.owner_mnemonic, 10)
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/LumberjacksDAOGovernanceToken.sol/LumberjacksDAOGovernanceToken.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(keys[2]).connect(provider)
    const contract = new ethers.Contract(configs.contracts.governance, ABI.abi, wallet)

    console.log("Reading balance for owner:", wallet.address)
    const result = await contract.balanceOf(wallet.address)
    console.log("Balance is:", result.toString())
    console.log("--")
    console.log("Minting new tokens to the owner..")
    const value = utils.parseEther("100000000")
    const calculatedTokenAmount = await contract.calculateTokenAmount(value)
    console.log("Calculated token amount:", calculatedTokenAmount.toString())
    const resultTransfer = await contract.mint(wallet.address, calculatedTokenAmount, { value })
    await resultTransfer.wait()
    console.log("Reading updated balance for owner")
    const result2 = await contract.balanceOf(wallet.address)
    console.log("Balance is:", result2.toString())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
