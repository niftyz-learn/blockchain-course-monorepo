const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/LumberjacksDAOAttestations.sol/LumberjacksDAOAttestations.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contracts.attestations, ABI.abi, wallet)

    const result = await contract.totalBalance(configs.owner_address)
    console.log("Total balance is:", result.toString())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
