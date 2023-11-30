const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/LumberjacksDAOGovernanceToken.sol/LumberjacksDAOGovernanceToken.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contracts.governance, ABI.abi, wallet)

    const balanceOfToken = await provider.getBalance(configs.contracts.governance)
    console.log("Withdrawing from contract:", balanceOfToken.toString())
    const result = await contract.withdraw()
    await result.wait()
    console.log("--")
    console.log("Reading ETH balance for owner..")
    const result2 = await provider.getBalance(configs.owner_address)
    console.log("Balance is:", result2.toString())
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
