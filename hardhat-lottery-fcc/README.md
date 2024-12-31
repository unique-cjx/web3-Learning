# Getting Started

## Requirements

Tools:
```
npm install --global hardhat-shorthand
```


## Usage

Deploy:

```
hh deploy
```

Testing

```
hh test
```

Test Coverage

```
hh coverage
```


## Chainlink
Recommended LINK amounts for Staging Test: 
- VRF: 2LINK
- Keepers: 8LINK

## Staging Test Process
1. Get SubId for Chainlink [VRF](https://vrf.chain.link).
2. Deploy contract using the SubId.
3. Register the contract with Chainlink VRF & it's SubId.
4. regoster the contract with Chainlink [Automation](https://automation.chain.link/sepolia).
5. Run `hh test --network sepolia` command.
