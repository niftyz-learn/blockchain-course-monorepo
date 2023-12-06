const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/LumberjacksDAOProposals.sol/LumberjacksDAOProposals.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contracts.proposals, ABI.abi, wallet)

    const metatada_uri = "ipfs://"
    const answer = 1

    const token_id = await contract.proposal_id_by_metadata_uri(metatada_uri)
    // Read voters
    const voters = await contract.getVoters(token_id)
    console.log("Voters:", voters)
    let results = {}
    for (let i = 0; i < voters.length; i++) {
        // Read your vote
        const vote = await contract.getVote(token_id, voters[i])
        if (results[vote[0].toString()] === undefined) {
            results[vote[0].toString()] = 0
        }
        results[vote[0].toString()] += parseInt(vote[1].toString())
    }
    console.table(results)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
