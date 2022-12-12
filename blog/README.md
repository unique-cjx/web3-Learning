# Complete Web3 Development

![Untitled](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/b0a920cd-0cb1-4046-b476-8d581b45215b/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20221206%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20221206T093716Z&X-Amz-Expires=86400&X-Amz-Signature=c2154153dd58cfd29371c6af09e413a5524c913f772e9c5750de440c9ecf9fdd&X-Amz-SignedHeaders=host&response-content-disposition=filename%3D%22Untitled.png%22&x-id=GetObject)

## 0x01 技术栈
1. Blockchain - [Polygon](https://polygon.technology/) (with optional RPC provider)
2. `Ethereum` development environment - [Hardhat](https://hardhat.org/)
3. Front end framework - [Next.js](https://nextjs.org/) & [React](https://reactjs.org/)
4. `Ethereum` web client library - [Ethers.js](https://docs.ethers.io/v5/)
5. File storage - [IPFS](https://ipfs.io/)
6. Indexing and querying - [The Graph Protocol](https://thegraph.com/en/)

## 0x02 准备工作

1. `Node.js`installed on your local machine
2. `MetaMask`Chrome extension installed in your browser

## 0x03 搭建项目

install all of the necessary dependencies, and configure the project.

### create a new Next.js application
```sh
npx create-next-app blog  
cd blog
```

### initialize the local smart contract development environment
```sh
npx hardhat
```