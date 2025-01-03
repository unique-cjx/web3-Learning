# Getting Started

## Requirements

Tools:
```
npm install --global hardhat-shorthand
```


## Usage

### Deploy

```
hh deploy
```

### Testing

Local Test
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

### Contract Address
```
0x2c39a1505240Bda58F7c06B89fFdc02d4e232260
```

### Test Wallet Address
```
0xfC2f22Bd7AAA08EACa1aA8b57A66D8d55341E62b
```

### Internal Txns
The actual caller `performUpkeep` function is `Automation`;
The actual caller `fulfillRandomWords`function is `VRFCoordinator`.