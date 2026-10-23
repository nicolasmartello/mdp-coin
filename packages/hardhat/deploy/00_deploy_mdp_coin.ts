import { deployScript, artifacts } from "../rocketh/deploy.js";

/**
 * Deploys the MdpCoin ERC-20 token, minting the whole supply to the deployer.
 *
 * @param env Rocketh environment object.
 */
export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const mdpCoin = await env.deploy("MdpCoin", {
      account: deployer,
      artifact: artifacts.MdpCoin,
      // Contract constructor arguments: initialHolder
      args: [deployer],
    });

    const totalSupply = await env.read(mdpCoin, { functionName: "totalSupply" });
    console.log("🪙 MdpCoin total supply:", totalSupply.toString());
  },
  {
    tags: ["MdpCoin"],
  },
);
