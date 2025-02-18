# Getting Started

## Quickstart

### Requirements

```
npm install --global hardhat-shorthand
```

### Run

```
hh run scripts/aaveBorrow.js
```

or run on a test

```
hh run scripts/aaveBorrow.js --network sepolia
```

### Forking from mainnet

You need to configure Hardhat Network to always do this:

```json
networks: {
  hardhat: {
    chainId: 31337.
    forking: {
      url: MAIN_RPC_URL,
    }
  }
}
```

# Contracts

### AggregatorV3Interface

> A price feed interface for getting asset prices

Retrieving `DAI/ETH` latest price information.

### ILendingPool (Aave V2)

> Main interface for Aave's lending protocol

- Deposit WETH
- Borrow/repay loans
- Track reserve states

### IWeth
> Interface for Wrapped Ether (WETH)

Allows conversion between ETH and WETH. Deposit ETH to get WETH.

### IERC20
> Standard interface for fungible tokens on Ethereum

Approve WETH limits.