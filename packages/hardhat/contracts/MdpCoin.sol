//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * MdpCoin (MDP): an immutable ERC-20 token with a fixed supply.
 * All tokens are minted once, in the constructor, to `initialHolder`.
 * There is no mint function, so the total supply can never grow.
 * Supports gasless approvals via signatures (EIP-2612 `permit`).
 */
contract MdpCoin is ERC20, ERC20Permit {
    // 1,000,000 tokens expressed in the smallest unit (18 decimals)
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;

    constructor(address initialHolder) ERC20("MdpCoin", "MDP") ERC20Permit("MdpCoin") {
        _mint(initialHolder, INITIAL_SUPPLY);
    }
}
