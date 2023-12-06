const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/LumberjacksDAOAttestations.sol/LumberjacksDAOAttestations.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contracts.attestations, ABI.abi, wallet)

    console.log("Reading balance for owner:", configs.owner_address)
    const id = configs.last_id
    const result = await contract.mint(configs.owner_address, id)
    const receipt = await result.wait()
    console.log("Gas used id:", receipt.gasUsed.toString())
    console.log("--")
    const balance = await contract.balanceOf(configs.owner_address, id)
    console.log("Balance is:", balance.toString())
    console.log("--")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
