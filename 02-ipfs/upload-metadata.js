const { NFTStorage, File, Blob } = require('nft.storage')
const fs = require('fs')
require('dotenv').config()

// See metadata standard here: https://docs.opensea.io/docs/metadata-standards

async function upload() {
    const NFT_STORAGE_TOKEN = process.env.nftstorage_key
    const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })
    const metadata = {
        "description": "Do you want to open the DAO in Ohio?",
        "external_url": "https://lumberjacksdao.io/proposals/1",
        "image": "https://bafkreiebe4o2ibucdystvdd7423rd7zaqnhaqi3pqtcj5jwbm32alwmixu.ipfs.nftstorage.link",
        "name": "Proposal #1",
        "attributes": [],
        "answers": [
            {
                "id": 1,
                "text": "Yes"
            },
            {
                "id": 2,
                "text": "No"
            }
        ]
    }
    console.log("Uploading...")
    const ipfs = await client.storeBlob(new Blob([JSON.stringify(metadata)]))
    console.log("File CID is:", ipfs)
    console.log("Link is:", "https://" + ipfs + ".ipfs.nftstorage.link")
}

upload()