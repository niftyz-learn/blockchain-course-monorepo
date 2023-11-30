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
    const bob = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    console.log("Reading balance for bob:", bob)
    const result2 = await contract.balanceOf(bob)
    console.log("Balance is:", result2.toString())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
