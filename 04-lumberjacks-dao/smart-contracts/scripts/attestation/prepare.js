const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/LumberjacksDAOAttestations.sol/LumberjacksDAOAttestations.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contracts.attestations, ABI.abi, wallet)

    const metadata_uri = "Qm...IPFS...." + new Date().getTime()
    const max_amount_of_tokens = 10
    const result = await contract.prepare(metadata_uri, max_amount_of_tokens)
    console.log("Waiting at:", result.hash)
    const receipt = await result.wait()
    console.log("New event is:", receipt.events[0].args.event_id.toString())
    console.log("Gas used:", receipt.gasUsed.toString())
    console.log("--")
    console.log("Reading created nft")
    const result2 = await contract.events(receipt.events[0].args.event_id)
    console.log("Event is:", result2)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
