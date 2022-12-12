const ipfsUrl = 'https://ipfs.io/ipfs'
const proxyUrl = 'http://127.0.0.1:7890'
const nf = require('node-fetch')
const proxyAgent = require('https-proxy-agent')
export async function fetch(id) {
    const url = `${ipfsUrl}/${id}`
    console.log("ipfs-url: ", url)
    const ag = new proxyAgent(proxyUrl)
    const response = await nf(url, { agent: ag })
    const data = await response.json()
    if (data.coverImage) {
        let coverImage = data.coverImage
        data.coverImage = `${ipfsUrl}/${coverImage}`
    }
    return data
}
