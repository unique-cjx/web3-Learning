// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MeNFT is ERC721 {
    string public tokenUrl;
    string public initName;
    string public initSymbol;

    uint256 private s_tokenCounter;

    constructor(string memory _url, string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        tokenUrl = _url;
        initName = _name;
        initSymbol = _symbol;
        s_tokenCounter = 0;
    }

    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        return tokenUrl;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
