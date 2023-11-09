const { NFTStorage, File, Blob } = require('nft.storage')
const fs = require('fs')
require('dotenv').config()

// See metadata standard here: https://docs.opensea.io/docs/metadata-standards

async function upload() {
    const NFT_STORAGE_TOKEN = process.env.nftstorage_key
    const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })
    const metadata = {
        "description": "This is a logo.",
        "external_url": "https://mywebsite.io/3",
        "image": "https://bafkreigpsmkqr5bwu5ech7wpxwohqpwoemuzmwe6esvyc3bjzrhmpucrwy.ipfs.nftstorage.link",
        "name": "Logo",
        "attributes": [
            {
                "trait_type": "Coolness",
                "value": "200%"
            }
        ]
    }
    console.log("Uploading...")
    const ipfs = await client.storeBlob(new Blob([JSON.stringify(metadata)]))
    console.log("File CID is:", ipfs)
    console.log("Link is:", "https://" + ipfs + ".ipfs.nftstorage.link")
}

upload()