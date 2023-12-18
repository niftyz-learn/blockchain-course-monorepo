<script setup>
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/vue'
import { sepolia } from 'viem/chains'

// 1. Get projectId at https://cloud.walletconnect.com
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

// 2. Create wagmiConfig
const metadata = {
  name: 'Lumberjacks DAO',
  description: 'A DAO for Lumberjacks',
  url: 'https://lumberjacksdao.io',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [sepolia]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains })
</script>

<template>
  <div v-if="!address">
    Enter the DAO<br><br>
  </div>
  <div>
    <w3m-button />
  </div><br /><br />
  <div v-if="address" style="text-align: center;">
    {{ balance }} {{ ticker }}<br />
    Voting power: {{ votingPower }}<br />
    <hr />
    <input type="text" placeholder="Enter ETH amount" v-model="amountToMint" /><br />
    {{ previewExchangeToken }} {{ ticker }} <br />
    <button @click="mintERC20Tokens">MINT</button>
  </div>
</template>

<script>
import { readContract, writeContract, watchAccount } from '@wagmi/core'
import { parseEther } from 'viem'
import ERC20ABI from "../abis/erc20.json"
import ERC721 from "../abis/erc721.json"
import ERC1155 from "../abis/erc1155.json"

export default {
  data() {
    return {
      governanceTokenAddress: "0xACe8984dBd4715a81C3f8060E5399c551B085054",
      attestationsTokenAddress: "0x54B729F8D8e1E58622e2672801c765711ABE7554",
      proposalTokenAddress: "0x428ba458AB28e7b7Fbb941E71bF09B23481dA776",
      address: "",
      ticker: "",
      balance: 0,
      votingPower: 0,
      amountToMint: 0,
      previewExchangeToken: 0
    }
  },
  watch: {
    async amountToMint() {
      const app = this
      const weiValue = parseEther(app.amountToMint)
      console.log("Wei value is:", weiValue.toString())
      const calculateTokenAmount = await readContract({
        chain: sepolia,
        address: app.governanceTokenAddress,
        abi: ERC20ABI,
        functionName: "calculateTokenAmount",
        args: [weiValue]
      })
      app.previewExchangeToken = calculateTokenAmount.toString()
      console.log("Token amount is:", calculateTokenAmount.toString())
    }
  },
  methods: {
    async readERC20TokenBalance() {
      const app = this
      const balance = await readContract({
        chain: sepolia,
        address: app.governanceTokenAddress,
        abi: ERC20ABI,
        functionName: "balanceOf",
        args: [app.address]
      })
      console.log("Balance of ERC20 token is", balance.toString())
      app.balance = (parseInt(balance.toString()) / 100).toFixed(2)
      const ticker = await readContract({
        chain: sepolia,
        address: app.governanceTokenAddress,
        abi: ERC20ABI,
        functionName: "symbol"
      })
      app.ticker = ticker
    },
    async readVotingPower() {
      const app = this
      const votingPower = await readContract({
        chain: sepolia,
        address: app.proposalTokenAddress,
        abi: ERC721,
        functionName: "votingPower",
        args: [app.address]
      })
      app.votingPower = votingPower.toString()
    },
    async mintERC20Tokens() {
      const app = this
      await writeContract({
        chain: sepolia,
        address: app.governanceTokenAddress,
        abi: ERC20ABI,
        functionName: "mint",
        args: [app.address, app.previewExchangeToken],
        value: parseEther(app.amountToMint)
      })
      app.readERC20TokenBalance()
    }
  },
  mounted() {
    const app = this
    watchAccount((account) => {
      if (account.address !== undefined) {
        console.log(`The current account is ${account.address}.`)
        app.address = account.address
        app.readERC20TokenBalance()
        app.readVotingPower()
      }
    })
  }
}
</script>