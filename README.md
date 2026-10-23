# MdpCoin (MDP) · Blockchain Lab

> [!WARNING]
> **This is a learning project.** MdpCoin is a fake coin: it **will never be deployed** to Ethereum mainnet or any public network, it has no value, and it cannot be bought or sold.

This repo is a **lab** for learning end-to-end blockchain development: writing a smart contract, testing it, deploying it to a local chain, and building a web interface that interacts with it. It is built on [Scaffold-ETH 2](https://scaffoldeth.io), an open-source starter kit for Ethereum dApps.

## What is MdpCoin

MdpCoin (symbol **MDP**) is an [ERC-20](https://eips.ethereum.org/EIPS/eip-20) token, Ethereum's standard for fungible tokens. Its logo is the Punta Mogotes lighthouse of Mar del Plata.

The contract ([`MdpCoin.sol`](packages/hardhat/contracts/MdpCoin.sol)) follows the conventions of real-world DeFi tokens:

- **Built on [OpenZeppelin](https://docs.openzeppelin.com/contracts/5.x/erc20)**: it inherits audited implementations instead of writing the standard from scratch.
- **Fixed supply of 1,000,000 MDP**: every token is minted once, at deployment. There is no `mint` function, so nobody can create more.
- **Immutable**: no proxy and not upgradeable. The deployed code is the final code.
- **Permit ([EIP-2612](https://eips.ethereum.org/EIPS/eip-2612))**: allowances can be granted with a signature, without paying gas for an `approve` transaction.

### MdpCoin is not a stablecoin

A stablecoin (such as USDC or DAI) holds a peg to a currency, for example 1 token = 1 USD, backed by reserves, collateral, or some stabilization mechanism.

**MdpCoin has none of that**:

- It is not pegged to the US dollar, the Argentine peso, or any other currency or asset.
- It is not backed by reserves or collateral.
- It has no price: it only exists on a local development blockchain, where tokens are handed out for free by a faucet.

## Why this stack

### Scaffold-ETH 2

It takes care of the tedious part of starting a dApp. It ships with a local blockchain, deploy scripts, a test wallet (*burner wallet*) with a faucet, and React hooks that read the ABI of the deployed contract. When you change and redeploy the contract, the frontend updates automatically and stays fully typed.

### Hardhat instead of Foundry

Scaffold-ETH 2 offers two frameworks for the smart contract side: [Hardhat](https://hardhat.org) and [Foundry](https://getfoundry.sh). We chose **Hardhat** because:

- **The whole project stays in TypeScript.** Tests, deploy scripts, and the frontend share the same language and libraries (ethers/viem). For someone coming from web development, the learning curve is shorter.
- **Tests look like real usage.** A Hardhat test calls the contract the same way a frontend or a script would: connect a signer, send a transaction, wait for the event. That helps build intuition for how contracts are consumed from the outside.
- **Built-in tooling**: a local network with `console.log` in Solidity, readable stack traces when a transaction reverts, and per-function gas reports.

Foundry is also a great option. It is faster (written in Rust), tests are written in Solidity, and it has built-in fuzzing, so it is widely used for audits and complex contracts. For this lab, keeping a single language across the project mattered more.

### Next.js

The frontend uses [Next.js](https://nextjs.org) with the **App Router**:

- **File-based routing and nested layouts.** Every folder in `app/` is a route, with no router to configure by hand. We use *route groups* to give each section its own layout without changing URLs:
  - `app/(wallet)/`: the wallet screens (`/`, `/send`, `/receive`), mobile-first.
  - `app/(dev)/`: developer tools (`/debug`, `/blockexplorer`), with a desktop layout.
- **Optimized builds** with code splitting, optimized fonts (`next/font`), and per-page metadata.
- **It comes integrated with Scaffold-ETH 2**, together with wagmi, viem, and RainbowKit.

**There is no custom backend.** Every page is statically generated at build time. The wallet screens are client components that read from and write to the blockchain directly from the browser, through the user's wallet. In a dApp, the smart contract is the backend. The Next.js server is only used during development (`yarn start`) to serve the app with hot reload.

## Project structure

```
packages/
├── hardhat/                    ← smart contracts
│   ├── contracts/MdpCoin.sol   ← the token
│   ├── deploy/                 ← deploy scripts (rocketh / hardhat-deploy)
│   └── test/MdpCoin.ts         ← contract tests
└── wallet-app/                 ← frontend
    ├── app/(wallet)/           ← wallet screens: wallet, activity, settings, send, receive
    ├── app/(dev)/              ← Debug Contracts and Block Explorer
    ├── components/ui/          ← shadcn/ui components, no blockchain logic
    ├── components/wallet/      ← wallet features (balance card, send form, activity…)
    ├── hooks/mdp/              ← token logic: balance, history, local faucet
    ├── styles/globals.css      ← design tokens for light and dark themes
    └── test/                   ← test harness: providers, MSW JSON-RPC node emulator
```

## Run locally

Requirements: [Node.js](https://nodejs.org) ≥ 22.10, [Yarn](https://yarnpkg.com), and Git.

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Start a local blockchain (Hardhat Network) and leave it running:
   ```bash
   yarn chain
   ```
3. In a second terminal, deploy MdpCoin to that chain:
   ```bash
   yarn deploy
   ```
4. In a third terminal, start the wallet and open http://localhost:3000:
   ```bash
   yarn start
   ```

The local burner wallet connects automatically. The **Faucet** tile gives you test ETH (for gas) and 100 MDP; from there you can send and receive MDP between local accounts.

## Testing

| Layer | Tools |
|---|---|
| Contracts | Hardhat test (Mocha + Chai, ethers), coverage with `hardhat test --coverage` |
| Wallet app | [Vitest](https://vitest.dev), [React Testing Library](https://testing-library.com/react), [MSW](https://mswjs.io), `@vitest/coverage-v8` |

Both packages fail their test command below **80% coverage**.

Wallet tests render the real components inside the same providers the app uses (wagmi, React Query, RainbowKit, theme, toasts; with test settings such as no query retries and a fixed theme) and connect the real Scaffold-ETH burner wallet. **Only the network is mocked**: MSW emulates the Hardhat JSON-RPC node with in-memory balances, blocks and Transfer logs, so a test that sends MDP really signs a transaction and sees the balances change. Hooks and components are never mocked, and any request without a handler fails the test.

## Test locally

No running chain is needed for the tests.

1. Run everything (contract coverage, then wallet tests with coverage):
   ```bash
   yarn test
   ```
2. Or one package at a time:
   ```bash
   yarn hardhat:coverage   # contracts
   yarn next:test          # wallet app
   ```
3. Watch mode while developing the wallet:
   ```bash
   yarn workspace @mdp-coin/wallet-app test:watch
   ```

## Credits

Built with [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2) by [BuidlGuidl](https://buidlguidl.com), [OpenZeppelin Contracts](https://www.openzeppelin.com/contracts), [Hardhat](https://hardhat.org), [Next.js](https://nextjs.org), [wagmi](https://wagmi.sh), [viem](https://viem.sh), [RainbowKit](https://www.rainbowkit.com), [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com), and [MSW](https://mswjs.io).

MIT licensed (see [LICENCE](LICENCE)).
