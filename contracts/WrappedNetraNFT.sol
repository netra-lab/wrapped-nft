// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721, IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Holder} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import {OptimizedERC721} from "./OptimizedERC721.sol";

error NotWhitelisted(IERC721 token);
error NotOwner(address sender, uint256 tokenId);
error ZeroAddress();
error EmptyTokenIds();

contract WrappedNetraNFT is
    Ownable,
    OptimizedERC721,
    ERC721Holder,
    ReentrancyGuard
{
    struct WrapInfo {
        address collection;
        uint96 tokenId;
    }

    mapping(IERC721 => bool) private s_whitelistedCollections;
    mapping(uint256 => WrapInfo) private s_wrappedTokens;
    uint256 private s_totalSupply;

    event CollectionWhitelisted(IERC721 indexed collection);
    event TokenWrapped(
        IERC721 indexed collection,
        uint256 tokenId,
        uint256 wrappedTokenId
    );
    event TokenUnwrapped(IERC721 indexed collection, uint256 tokenId);

    constructor(
        string memory name,
        string memory symbol,
        address controller
    ) OptimizedERC721(name, symbol) {
        _transferOwnership(controller);
    }

    function totalSupply() external view returns (uint256) {
        return s_totalSupply;
    }

    function getWrapInfo(uint256 tokenId)
        external
        view
        returns (WrapInfo memory)
    {
        return s_wrappedTokens[tokenId];
    }

    function batchWrap(IERC721 collection, uint256[] calldata tokenIds)
        external
        nonReentrant
    {
        if (!isWhitelisted(collection)) revert NotWhitelisted(collection);
        if (tokenIds.length == 0) revert EmptyTokenIds();

        uint256 _totalSupply = s_totalSupply;
        for (uint256 i = 0; i < tokenIds.length; ) {
            uint256 tokenId = tokenIds[i];

            collection.transferFrom(msg.sender, address(this), tokenId);

            uint256 wrappedTokenId = ++_totalSupply;

            _minimalOnMint(msg.sender, wrappedTokenId);
            s_wrappedTokens[wrappedTokenId] = WrapInfo(
                address(collection),
                uint96(tokenId)
            );

            emit TokenWrapped(collection, tokenId, wrappedTokenId);

            unchecked {
                ++i;
            }
        }

        _minimalAfterMint(msg.sender, tokenIds.length);
        s_totalSupply = _totalSupply;
    }

    function wrap(IERC721 collection, uint256 tokenId) external nonReentrant {
        if (!isWhitelisted(collection)) revert NotWhitelisted(collection);

        collection.transferFrom(msg.sender, address(this), tokenId);

        uint256 wrappedTokenId = s_totalSupply + 1;
        s_totalSupply = wrappedTokenId;

        _minimalOnMint(msg.sender, wrappedTokenId);
        _minimalAfterMint(msg.sender, 1);
        s_wrappedTokens[wrappedTokenId] = WrapInfo(
            address(collection),
            uint96(tokenId)
        );

        emit TokenWrapped(collection, tokenId, wrappedTokenId);
    }

    function batchUnwrap(uint256[] calldata tokenIds) external nonReentrant {
        for (uint256 i = 0; i < tokenIds.length; ) {
            uint256 tokenId = tokenIds[i];

            if (msg.sender != ownerOf(tokenId)) {
                revert NotOwner(msg.sender, tokenId);
            }

            WrapInfo memory wrapInfo = s_wrappedTokens[tokenId];
            IERC721 collection = IERC721(wrapInfo.collection);

            collection.safeTransferFrom(
                address(this),
                msg.sender,
                wrapInfo.tokenId
            );
            emit TokenUnwrapped(collection, wrapInfo.tokenId);

            _burn(tokenId);
            delete s_wrappedTokens[tokenId];
            unchecked {
                ++i;
            }
        }

        unchecked {
            s_totalSupply -= tokenIds.length;
        }
    }

    function unwrap(uint256 tokenId) external nonReentrant {
        if (msg.sender != ownerOf(tokenId)) {
            revert NotOwner(msg.sender, tokenId);
        }

        WrapInfo memory wrapInfo = s_wrappedTokens[tokenId];
        IERC721 collection = IERC721(wrapInfo.collection);

        collection.safeTransferFrom(
            address(this),
            msg.sender,
            wrapInfo.tokenId
        );
        emit TokenUnwrapped(collection, wrapInfo.tokenId);

        _burn(tokenId);
        delete s_wrappedTokens[tokenId];
        unchecked {
            s_totalSupply -= 1;
        }
    }

    function whitelistCollection(IERC721 collection) external onlyOwner {
        if (address(collection) == address(0)) revert ZeroAddress();
        s_whitelistedCollections[collection] = true;
        emit CollectionWhitelisted(collection);
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
