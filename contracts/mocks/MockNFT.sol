// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {ERC721, ERC721Royalty} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";

contract MockNFT is ERC721Royalty {
    using Counters for Counters.Counter;

    Counters.Counter private s_tokenIdCounter;

    constructor() ERC721("Mock", "MOCK") {
        _setDefaultRoyalty(address(this), 1000);
    }

    function mint(uint256 amount) external {
        for (uint256 i = 0; i < amount; ++i) {
            s_tokenIdCounter.increment();
            uint256 tokenId = s_tokenIdCounter.current();

            _mint(msg.sender, tokenId);
        }
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://centralized-metadata.com/";
    }
}
