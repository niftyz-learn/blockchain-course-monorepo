const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/LumberjacksDAOProposals.sol/LumberjacksDAOProposals.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contracts.proposals, ABI.abi, wallet)

    console.log("Reading voting power for owner:", configs.owner_address)
    const result = await contract.votingPower(configs.owner_address)
    console.log("Power is:", result.toString())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
