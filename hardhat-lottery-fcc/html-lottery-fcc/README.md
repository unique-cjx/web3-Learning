## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


# Usage

1. Run your local blockchain node

```bash
cd hardhat-lottery-fcc directory
hh node
```

2. Add hardhat network to your metamask/wallet

- Get the RPC_URL of your hh node (usually `http://127.0.0.1:8545/`)
- Go to your wallet and add a new network. 
  - Network Name: Hardhat-Localhost
  - New RPC URL: http://127.0.0.1:8545/
  - Chain ID: 31337
  - Currency Symbol: ETH
  - Block Explorer URL: None

## How to pick the winner

> execute the following command in the hardhat-lottery-fcc directory:
``` bash
hh run scripts/mock_off_chain.js --network localhost
```

# Deploying to IPFS

1. build static code

```bash
npm run build
```
After running the above command, Next.js will create an out folder with the HTML/CSS/JS assets for your application.

2. import out folder to IPFS files

3. Copy the CID of the folder you pinned

5. Get [IPFS companion](https://chrome.google.com/webstore/detail/ipfs-companion/nibjojkomfdiaoajekhjakgkdhaomnch?hl=en) for your browser (or use [Brave Browser](https://brave.com/))

5. Go to `ipfs://YOUR_CID_HERE` and see your ipfs deployed site!