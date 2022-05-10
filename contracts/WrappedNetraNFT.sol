// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721, ERC721, IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";

error NotWhitelisted(IERC721 token);
error NotOwner(address sender, uint256 tokenId);
error ZeroAddress();

contract WrappedNetraNFT is Ownable, ERC721, ERC721Holder {
    using Counters for Counters.Counter;

    struct WrapInfo {
        address collection;
        uint96 tokenId;
    }

    mapping(IERC721 => bool) private s_whitelistedCollections;
    mapping(uint256 => WrapInfo) private s_wrappedTokens;

    Counters.Counter private s_tokenIdCounter;
    uint256 private s_burnedTokens;

    event CollectionWhitelisted(IERC721 indexed collection);
    event TokenWrapped(
        IERC721 indexed collection,
        uint256 tokenId,
        uint256 wrappedTokenId
    );
    event TokenUnwrapped(IERC721 indexed collection, uint256 tokenId);

    constructor(address controller) ERC721("Wrapped Netra NFT", "wNETRA") {
        _transferOwnership(controller);
    }

    function totalSupply() external view returns (uint256) {
        return s_tokenIdCounter.current() - s_burnedTokens;
    }

    function getWrapInfo(uint256 tokenId)
        external
        view
        returns (WrapInfo memory)
    {
        return s_wrappedTokens[tokenId];
    }

    function wrap(IERC721 collection, uint256 tokenId) external {
        if (!isWhitelisted(collection)) revert NotWhitelisted(collection);

        collection.transferFrom(msg.sender, address(this), tokenId);

        s_tokenIdCounter.increment();
        uint256 wrappedTokenId = s_tokenIdCounter.current();

        _safeMint(msg.sender, wrappedTokenId);
        s_wrappedTokens[wrappedTokenId] = WrapInfo(
            address(collection),
            uint96(tokenId)
        );

        emit TokenWrapped(collection, tokenId, wrappedTokenId);
    }

    function unwrap(uint256 tokenId) external {
        if (msg.sender != ownerOf(tokenId)) {
            revert NotOwner(msg.sender, tokenId);
        }

        WrapInfo memory wrapInfo = s_wrappedTokens[tokenId];
        IERC721 token = IERC721(wrapInfo.collection);

        token.transferFrom(address(this), msg.sender, wrapInfo.tokenId);
        emit TokenUnwrapped(token, wrapInfo.tokenId);

        _burn(tokenId);
        delete s_wrappedTokens[tokenId];
        s_burnedTokens += 1;
    }

    function whitelistCollection(IERC721 token) external onlyOwner {
        if (address(token) == address(0)) revert ZeroAddress();
        s_whitelistedCollections[token] = true;
        emit CollectionWhitelisted(token);
    }

    function isWhitelisted(IERC721 collection) public view returns (bool) {
        return s_whitelistedCollections[collection];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        WrapInfo memory wrapInfo = s_wrappedTokens[tokenId];
        return IERC721Metadata(wrapInfo.collection).tokenURI(wrapInfo.tokenId);
    }
}
