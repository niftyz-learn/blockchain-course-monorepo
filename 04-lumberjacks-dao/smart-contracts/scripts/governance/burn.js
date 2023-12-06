const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/LumberjacksDAOGovernanceToken.sol/LumberjacksDAOGovernanceToken.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contracts.governance, ABI.abi, wallet)

    console.log("Reading balance for owner:", configs.owner_address)
    const result = await contract.balanceOf(configs.owner_address)
    console.log("Balance is:", result.toString())
    console.log("--")
    console.log("Minting new tokens to the owner..")
    const burning = (parseInt(result.toString()) / 2).toFixed(0)
    console.log("Burning token amount:", burning)
    const resultTransfer = await contract.burn(burning)
    await resultTransfer.wait()
    console.log("Reading updated balance for owner")
    const result2 = await contract.balanceOf(configs.owner_address)
    console.log("Balance is:", result2.toString())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
