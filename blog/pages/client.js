import { create } from 'ipfs-http-client'

// define the ipfs endpoint
const projectId = '2IRUEOqbeDe5rmZw99TacW3c3Wj'
const projectSecret = '872c8eab5c94a6c781669aaca145cff1'
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
const client = create({
    url: 'https://ipfs.infura.io:5001/api/v0',
    headers: {
        authorization: auth
    }
})

export default client