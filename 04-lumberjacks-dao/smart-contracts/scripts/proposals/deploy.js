const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const configs = JSON.parse(fs.readFileSync(process.env.CONFIG).toString())
  console.log('Deploying contract..')
  const ContractFactory = await hre.ethers.getContractFactory("Proposals");
  const contract = await ContractFactory.deploy();
  console.log('Deploy transaction is: ' + contract.deployTransaction.hash)
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
  configs.contracts.proposals = contract.address
  fs.writeFileSync(process.env.CONFIG, JSON.stringify(configs, null, 4))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
