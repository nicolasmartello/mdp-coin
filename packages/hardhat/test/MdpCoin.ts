import { expect } from "chai";
import { network } from "hardhat";
import type { Abi_MdpCoin } from "../generated/abis/MdpCoin.js";
import { loadAndExecuteDeploymentsFromFiles } from "../rocketh/environment.js";

const { provider, networkHelpers, ethers } = await network.create();

const INITIAL_SUPPLY = ethers.parseUnits("1000000", 18);

// We define a fixture to reuse the same setup in every test.
async function deployFixture() {
  const env = await loadAndExecuteDeploymentsFromFiles({ provider });
  const { address, abi } = env.get<Abi_MdpCoin>("MdpCoin");
  const mdpCoin = await ethers.getContractAt(abi, address);
  const [deployer, alice, bob] = await ethers.getSigners();
  return { mdpCoin, deployer, alice, bob };
}

describe("MdpCoin", function () {
  describe("Deployment", function () {
    it("Should have the right name, symbol and decimals", async function () {
      const { mdpCoin } = await networkHelpers.loadFixture(deployFixture);
      expect(await mdpCoin.name()).to.equal("MdpCoin");
      expect(await mdpCoin.symbol()).to.equal("MDP");
      expect(await mdpCoin.decimals()).to.equal(18n);
    });

    it("Should mint the whole supply to the deployer", async function () {
      const { mdpCoin, deployer } = await networkHelpers.loadFixture(deployFixture);
      expect(await mdpCoin.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await mdpCoin.balanceOf(deployer.address)).to.equal(INITIAL_SUPPLY);
    });
  });

  describe("Transfers", function () {
    it("Should move tokens and emit Transfer", async function () {
      const { mdpCoin, deployer, alice } = await networkHelpers.loadFixture(deployFixture);
      const amount = ethers.parseUnits("100", 18);

      await expect(mdpCoin.transfer(alice.address, amount))
        .to.emit(mdpCoin, "Transfer")
        .withArgs(deployer.address, alice.address, amount);
      expect(await mdpCoin.balanceOf(alice.address)).to.equal(amount);
      expect(await mdpCoin.balanceOf(deployer.address)).to.equal(INITIAL_SUPPLY - amount);
    });

    it("Should revert when the sender has insufficient balance", async function () {
      const { mdpCoin, alice, bob } = await networkHelpers.loadFixture(deployFixture);
      await expect((mdpCoin.connect(alice) as typeof mdpCoin).transfer(bob.address, 1n)).to.be.revertedWithCustomError(
        mdpCoin,
        "ERC20InsufficientBalance",
      );
    });
  });

  describe("Allowances", function () {
    it("Should let an approved spender use transferFrom", async function () {
      const { mdpCoin, deployer, alice, bob } = await networkHelpers.loadFixture(deployFixture);
      const amount = ethers.parseUnits("50", 18);

      await expect(mdpCoin.approve(alice.address, amount))
        .to.emit(mdpCoin, "Approval")
        .withArgs(deployer.address, alice.address, amount);
      await (mdpCoin.connect(alice) as typeof mdpCoin).transferFrom(deployer.address, bob.address, amount);

      expect(await mdpCoin.balanceOf(bob.address)).to.equal(amount);
      expect(await mdpCoin.allowance(deployer.address, alice.address)).to.equal(0n);
    });

    it("Should revert transferFrom without enough allowance", async function () {
      const { mdpCoin, deployer, alice, bob } = await networkHelpers.loadFixture(deployFixture);
      await expect(
        (mdpCoin.connect(alice) as typeof mdpCoin).transferFrom(deployer.address, bob.address, 1n),
      ).to.be.revertedWithCustomError(mdpCoin, "ERC20InsufficientAllowance");
    });
  });

  describe("Permit (EIP-2612)", function () {
    // Signs an off-chain approval: no transaction, no gas for the token holder
    async function signPermit(
      mdpCoin: Awaited<ReturnType<typeof deployFixture>>["mdpCoin"],
      owner: Awaited<ReturnType<typeof deployFixture>>["deployer"],
      spender: string,
      value: bigint,
      deadline: bigint,
    ) {
      const { chainId } = await ethers.provider.getNetwork();
      const domain = { name: "MdpCoin", version: "1", chainId, verifyingContract: await mdpCoin.getAddress() };
      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };
      const nonce = await mdpCoin.nonces(owner.address);
      const signature = await owner.signTypedData(domain, types, {
        owner: owner.address,
        spender,
        value,
        nonce,
        deadline,
      });
      return ethers.Signature.from(signature);
    }

    it("Should set the allowance from a signature submitted by someone else", async function () {
      const { mdpCoin, deployer, alice } = await networkHelpers.loadFixture(deployFixture);
      const value = ethers.parseUnits("10", 18);
      const deadline = BigInt(await networkHelpers.time.latest()) + 3600n;
      const { v, r, s } = await signPermit(mdpCoin, deployer, alice.address, value, deadline);

      // Alice submits (and pays gas for) the deployer's signed approval
      await expect(
        (mdpCoin.connect(alice) as typeof mdpCoin).permit(deployer.address, alice.address, value, deadline, v, r, s),
      )
        .to.emit(mdpCoin, "Approval")
        .withArgs(deployer.address, alice.address, value);
      expect(await mdpCoin.allowance(deployer.address, alice.address)).to.equal(value);
      expect(await mdpCoin.nonces(deployer.address)).to.equal(1n);
    });

    it("Should reject an expired signature", async function () {
      const { mdpCoin, deployer, alice } = await networkHelpers.loadFixture(deployFixture);
      const deadline = BigInt(await networkHelpers.time.latest()) - 1n;
      const { v, r, s } = await signPermit(mdpCoin, deployer, alice.address, 1n, deadline);

      await expect(
        mdpCoin.permit(deployer.address, alice.address, 1n, deadline, v, r, s),
      ).to.be.revertedWithCustomError(mdpCoin, "ERC2612ExpiredSignature");
    });

    it("Should reject a replayed signature", async function () {
      const { mdpCoin, deployer, alice } = await networkHelpers.loadFixture(deployFixture);
      const deadline = BigInt(await networkHelpers.time.latest()) + 3600n;
      const { v, r, s } = await signPermit(mdpCoin, deployer, alice.address, 1n, deadline);

      await mdpCoin.permit(deployer.address, alice.address, 1n, deadline, v, r, s);
      await expect(
        mdpCoin.permit(deployer.address, alice.address, 1n, deadline, v, r, s),
      ).to.be.revertedWithCustomError(mdpCoin, "ERC2612InvalidSigner");
    });
  });
});
