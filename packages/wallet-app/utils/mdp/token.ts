/**
 * Static metadata of the MdpCoin token. These values are fixed in the contract
 * (packages/hardhat/contracts/MdpCoin.sol), so there is no need to read them on-chain.
 */
export const MDP_TOKEN = {
  contractName: "MdpCoin",
  name: "MdpCoin",
  symbol: "MDP",
  decimals: 18,
} as const;
