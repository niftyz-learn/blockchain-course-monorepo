const { NFTStorage, File, Blob } = require('nft.storage')
const fs = require('fs')
require('dotenv').config()

async function upload() {
    const NFT_STORAGE_TOKEN = process.env.nftstorage_key
    const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })
    const asset = fs.readFileSync('./assets/lumberjack.jpg')
    console.log("Uploading...")
    const ipfs = await client.storeBlob(new Blob([asset]))
    console.log("File CID is:", ipfs)
    console.log("Link is:", "https://" + ipfs + ".ipfs.nftstorage.link")
}

upload()