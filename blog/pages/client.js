import { create } from 'ipfs-http-client'

// define the ipfs endpoint
const projectId = ''
const projectSecret = ''
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
const client = create({
    url: 'https://ipfs.infura.io:5001/api/v0',
    headers: {
        authorization: auth
    }
})

export default client
