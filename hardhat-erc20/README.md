# Getting Started

## Quickstart

### Requirements
```
npm install --global hardhat-shorthand
```

### Deployment to a testnet
1. Setup environment variabltes
You have to set your `SEPOLIA_RPC_URL` and `PRIVATE_KEY` as environment variables. You can add them to a `.env` file.

2. Get some testnet ETH

3. Verify your contract
You can get an [API Key](https://etherscan.io/myapikey) from Etherscan and set it as an environemnt variable named `ETHERSCAN_API_KEY`.

you can manual verify with:
```
hh verify --constructor-args arguments DEPLOYED_CONTRACT_ADDRESS
```

4. Deploy
```
hh deploy --network sepolia
```