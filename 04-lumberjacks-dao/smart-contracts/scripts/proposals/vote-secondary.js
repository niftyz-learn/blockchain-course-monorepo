const { ethers, utils } = require("ethers");
const fs = require('fs');
const { derive } = require('../../libs/address_generator')

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/LumberjacksDAOProposals.sol/LumberjacksDAOProposals.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    const { keys } = await derive(configs.owner_mnemonic, 10)
    console.log("Voting with address:", keys[3])
    let wallet = new ethers.Wallet(keys[2]).connect(provider)
    console.log("Wallet:", wallet.address)
    const contract = new ethers.Contract(configs.contracts.proposals, ABI.abi, wallet)

    const metatada_uri = "ipfs://"
    const answer = 3

    const token_id = await contract.proposal_id_by_metadata_uri(metatada_uri)
    try {
        const result = await contract.vote(token_id, answer)
        console.log("Waiting at", result.hash)
        await result.wait()
    } catch (e) {
        console.log(e)
        console.log("Can't vote twice")
    }
    // Read voters
    const voters = await contract.getVoters(token_id)
    console.log("Voters:", voters)
    // Read your vote
    const your_vote = await contract.getVote(token_id, configs.owner_address)
    console.log("Your vote:", your_vote)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
