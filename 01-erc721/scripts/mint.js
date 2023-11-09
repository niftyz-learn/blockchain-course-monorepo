const { ethers, utils } = require("ethers");
const fs = require('fs');

async function main() {
    const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
    const ABI = JSON.parse(fs.readFileSync('./artifacts/contracts/' + configs.contract_name + '.sol/' + configs.contract_name + '.json').toString())
    const provider = new ethers.providers.JsonRpcProvider(configs.provider);
    let wallet = new ethers.Wallet(configs.owner_key).connect(provider)
    const contract = new ethers.Contract(configs.contract_address, ABI.abi, wallet)

    const uri = "https://bafkreie4dfdksfyam3kdywwzyj34cquu2rjdn6qtmcwenajfg2mui6mpvy.ipfs.nftstorage.link"
    const result = await contract.mint(configs.owner_address, uri)
    console.log("Waiting at:", result.hash)
    const receipt = await result.wait()
    console.log("Token ID minted:", receipt.events[0].args[2].toString())
    fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
    console.log("💸 Gas used:", receipt.gasUsed.toString())

    // Live example here: https://testnets.opensea.io/assets/sepolia/0xfbb4c4a1d5382fbf709d23b42c62c79a7fef3154/0
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
