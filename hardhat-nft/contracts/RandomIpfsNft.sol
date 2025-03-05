// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

/* Contract Errors */
error RandomIpfsNft__RangeOutOfBreeds();
error RandomIpfsNft_NeedMoreETHsent();
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is ERC721URIStorage, VRFConsumerBaseV2Plus {
    /* Initial Contract Variables */
    uint256 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private immutable NUM_WORDS = 1;
    uint256 internal immutable i_mintFee;

    // VRF Helpers
    mapping(uint256 => address) public s_requestIdToSender;

    // NFT Variables
    uint256 public s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogeTokenUrls;

    // Doge Type Description
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    /* Events */
    event NftRequested(uint256 indexed requestId, address indexed requester);
    event NftMinted(uint256 indexed tokenId, Breed dogeBreed, address minter);

    constructor(
        address vrfCoordinator,
        uint256 subscriptionId,
        bytes32 gasLen,
        uint32 callbackGasLimit,
        string[3] memory dogeTokenUrls,
        uint256 mintFee
    ) VRFConsumerBaseV2Plus(vrfCoordinator) ERC721("Random IPFS NFT", "DOG") {
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLen;
        i_callbackGasLimit = callbackGasLimit;
        s_dogeTokenUrls = dogeTokenUrls;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft_NeedMoreETHsent();
        }
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_gasLane,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                // Set "nativePayment" to true to pay for VRF requests with ETH instead of LINK
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
            })
        );
        s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        address tokenOwner = s_requestIdToSender[requestId];
        uint256 tokenId = s_tokenCounter;
        uint256 moddedRing = randomWords[0] % MAX_CHANCE_VALUE;
        // 0-99
        // 7 -> PUG
        // 12 -> Shiba Inu
        // 88 -> St. Bernard
        // 45 -> St. Bernard
        Breed dogBreed = getBreedFromModdedRng(moddedRing);
        s_tokenCounter = tokenId + 1;
        _safeMint(tokenOwner, tokenId);
        _setTokenURI(tokenId, s_dogeTokenUrls[uint256(dogBreed)]);

        emit NftMinted(tokenId, dogBreed, tokenOwner);
    }

    function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();

        // if moddedRng = 10
        // round 1, i = 0, cumulativeSum = 0
        // 10 >= cumulativeSum && 10 < cumulativeSum + 10 = false
        // round 2, i = 1, cumulativeSum = 10
        // 10 >= cumulativeSum && 10 < cumulativeSum + 30 = true
        // return Breed(1)
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
                return Breed(i);
            }
            cumulativeSum += chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBreeds();
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenUrl(uint256 index) public view returns (string memory) {
        return s_dogeTokenUrls[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
