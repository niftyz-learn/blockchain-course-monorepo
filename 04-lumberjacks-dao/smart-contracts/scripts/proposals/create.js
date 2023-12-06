const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/LumberjacksDAOProposals.sol/LumberjacksDAOProposals.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contracts.proposals, ABI.abi, wallet)

    const metatada_uri = "ipfs://"
    const start_date = parseInt(new Date().getTime() / 1000)
    const end_date = parseInt(new Date().getTime() / 1000) + 60 * 60 * 24 * 7
    const min_power_to_vote = 100

    const result = await contract.create(metatada_uri, start_date, end_date, min_power_to_vote)
    console.log("Waiting at", result.hash)
    await result.wait()
    // Read proposal
    const token_id = await contract.proposal_id_by_metadata_uri(metatada_uri)
    const proposal = await contract.proposals(token_id)
    console.log("Proposal created:", proposal)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
