// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AllenToken is ERC20 {
    constructor(
        uint256 initialSupply,
        string memory initialName,
        string memory initialSymbol
    ) ERC20(initialName, initialSymbol) {
        _mint(msg.sender, initialSupply);
    }
}
