# MdpCoin (MDP) · Blockchain Lab

> [!WARNING]
> **Este es un proyecto de aprendizaje.** MdpCoin es una moneda de prueba (*fake coin*): **nunca va a ser desplegada** en Ethereum mainnet ni en ninguna red pública, no tiene valor y no se puede comprar ni vender.

Este repo es un **laboratorio** para aprender desarrollo blockchain de punta a punta: escribir un smart contract, testearlo, desplegarlo en una cadena local y construir una interfaz web que interactúe con él. Está construido sobre [Scaffold-ETH 2](https://scaffoldeth.io), un kit de inicio open source para dApps en Ethereum.

## Qué es MdpCoin

MdpCoin (símbolo **MDP**) es un token [ERC-20](https://eips.ethereum.org/EIPS/eip-20), el estándar de tokens fungibles de Ethereum. El contrato ([`MdpCoin.sol`](packages/hardhat/contracts/MdpCoin.sol)) sigue las convenciones de los tokens DeFi reales:

- **Construido sobre [OpenZeppelin](https://docs.openzeppelin.com/contracts/5.x/erc20)**: heredamos implementaciones auditadas en vez de escribir el estándar desde cero.
- **Supply fijo de 1.000.000 MDP**: se acuñan todos una sola vez, al desplegar el contrato. No existe función `mint`, así que nadie puede crear más.
- **Inmutable**: no usa proxies ni es actualizable. El código desplegado es el código final.
- **Permit ([EIP-2612](https://eips.ethereum.org/EIPS/eip-2612))**: permite aprobar gastos con una firma, sin pagar gas por una transacción de `approve`.

### MdpCoin no es una stablecoin

Una stablecoin (como USDC o DAI) mantiene paridad con una moneda, por ejemplo 1 token = 1 USD, gracias a reservas, colateral o algún mecanismo de estabilización.

**MdpCoin no tiene nada de eso**:

- No tiene paridad con el dólar, el peso ni ninguna otra moneda o activo.
- No está respaldada por reservas ni colateral.
- No tiene precio: solo existe en una blockchain local de desarrollo, donde los tokens se generan gratis con un faucet.

## Por qué este stack

### Scaffold-ETH 2

Resuelve la parte tediosa de arrancar una dApp: viene con una blockchain local, scripts de deploy, una wallet de prueba (*burner wallet*) con faucet, y hooks de React que leen el ABI del contrato desplegado. Cuando cambiás y volvés a desplegar el contrato, el frontend se actualiza solo y queda tipado automáticamente.

### Hardhat en vez de Foundry

Scaffold-ETH 2 ofrece dos frameworks para la parte de smart contracts: [Hardhat](https://hardhat.org) y [Foundry](https://getfoundry.sh). Elegimos **Hardhat** porque:

- **Todo el proyecto queda en TypeScript.** Los tests, los scripts de deploy y el frontend usan el mismo lenguaje y las mismas librerías (ethers/viem). Para alguien que viene del desarrollo web, la curva de aprendizaje es más corta.
- **Los tests se parecen al uso real.** Un test de Hardhat llama al contrato igual que lo haría un frontend o un script: conecta un signer, manda una transacción, espera el evento. Eso ayuda a entender cómo se consume un contrato desde afuera.
- **Herramientas incluidas**: red local con `console.log` en Solidity, stack traces legibles cuando una transacción revierte y reporte de gas por función.

Foundry también es una gran opción. Es más rápido (está escrito en Rust), los tests se escriben en Solidity y trae fuzzing incorporado, y es muy usado para auditorías y para contratos complejos. Para este laboratorio pesó más mantener un único lenguaje en todo el proyecto.

### Next.js

El frontend usa [Next.js](https://nextjs.org) con el **App Router**:

- **Ruteo por archivos y layouts anidados.** Cada carpeta en `app/` es una ruta, sin configurar un router a mano. Usamos *route groups* para darle a cada sección su propio diseño sin cambiar las URLs:
  - `app/(wallet)/`: las pantallas de la wallet (`/`, `/send`, `/receive`), mobile-first.
  - `app/(dev)/`: herramientas de desarrollo (`/debug`, `/blockexplorer`), con diseño de escritorio.
- **Build optimizado** con code splitting, fuentes optimizadas (`next/font`) y metadata por página.
- **Viene integrado con Scaffold-ETH 2** junto con wagmi, viem y RainbowKit.

**No usamos un backend propio.** Todas las páginas se generan como estáticas en el build. Las pantallas de la wallet son componentes de cliente que leen y escriben directo en la blockchain desde el navegador, a través de la wallet del usuario. En una dApp el "backend" es el smart contract. El servidor de Next solo se usa en desarrollo (`yarn start`) para servir la app con hot reload.

## Estructura del proyecto

```
packages/
├── hardhat/                    ← smart contracts
│   ├── contracts/MdpCoin.sol   ← el token
│   ├── deploy/                 ← scripts de deploy (rocketh / hardhat-deploy)
│   └── test/MdpCoin.ts         ← tests del contrato
└── nextjs/                     ← frontend
    ├── app/(wallet)/           ← pantallas de la wallet
    ├── app/(dev)/              ← Debug Contracts y Block Explorer
    ├── components/ui/          ← componentes visuales reutilizables, sin lógica blockchain
    ├── components/wallet/      ← componentes de la wallet (saldo, envío, actividad…)
    ├── hooks/mdp/              ← lógica del token: saldo, historial, faucet local
    └── styles/globals.css      ← design tokens: colores, tipografía, radios (Tailwind + DaisyUI)
```

## Cómo correrlo

Requisitos: [Node.js](https://nodejs.org) ≥ 22.10, [Yarn](https://yarnpkg.com) y Git.

```bash
yarn install

# Cada comando en una terminal distinta:
yarn chain     # levanta una blockchain local (Hardhat Network)
yarn deploy    # despliega MdpCoin en esa cadena local
yarn start     # abre la wallet en http://localhost:3000
```

En la wallet, el botón **Faucet** te da ETH de prueba (para pagar gas) y 100 MDP. A partir de ahí podés enviar y recibir MDP entre cuentas locales.

Tests del contrato:

```bash
yarn hardhat:test
```

## Créditos

Construido con [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2) de [BuidlGuidl](https://buidlguidl.com), [OpenZeppelin Contracts](https://www.openzeppelin.com/contracts), [Hardhat](https://hardhat.org), [Next.js](https://nextjs.org), [wagmi](https://wagmi.sh), [viem](https://viem.sh), [RainbowKit](https://www.rainbowkit.com), [Tailwind CSS](https://tailwindcss.com) y [DaisyUI](https://daisyui.com).

Licencia MIT (ver [LICENCE](LICENCE)).
