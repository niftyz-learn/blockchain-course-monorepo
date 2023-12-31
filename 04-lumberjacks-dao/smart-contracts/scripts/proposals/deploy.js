const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
  console.log('Deploying contract..')
  const ContractFactory = await hre.ethers.getContractFactory("LumberjacksDAOProposals");
  const contract = await ContractFactory.deploy(configs.owner_address, configs.contracts.attestations, configs.contracts.governance);
  console.log('Deploy transaction is: ' + contract.deployTransaction.hash)
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
  configs.contracts.proposals = contract.address
  configs.arguments.proposals = [configs.owner_address, configs.contracts.attestations, configs.contracts.governance]
  fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
