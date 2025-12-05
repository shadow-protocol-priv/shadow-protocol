# Shadow Protocol Project Structure

This document outlines the overall directory structure and file organization for the Shadow Protocol project. The project is organized as a monorepo using workspaces to manage multiple packages (contracts, solvers, SDK, frontend) while maintaining shared dependencies and tooling.

## Root Directory Structure

```
shadowprotocol/
├── packages/
│   ├── contracts/          # Solidity smart contracts
│   ├── solvers/            # Rust solver nodes
│   ├── sdk/                # TypeScript SDK for integration
│   └── frontend/           # Next.js frontend application
├── docs/                   # Documentation and architecture
├── scripts/                # Deployment and utility scripts
├── tests/                  # Cross-package integration tests
├── .github/                # CI/CD workflows
├── package.json            # Root package.json for monorepo management
├── Cargo.toml              # Root Cargo.toml for Rust workspaces
├── README.md               # Project overview and setup
├── LICENSE                 # MIT License
└── .gitignore
```

## Package Details

### packages/contracts/

Solidity contracts deployed on Base network.

```
contracts/
├── src/
│   ├── ShadowRouter.sol       # Main intent router contract
│   ├── IntentVerifier.sol     # Intent verification logic
│   ├── FeeManager.sol         # Fee collection and distribution
│   └── interfaces/            # Contract interfaces
│       ├── IShadowRouter.sol
│       └── IIntentVerifier.sol
├── test/                      # Foundry/Forge tests
├── script/                    # Deployment scripts
├── foundry.toml               # Foundry configuration
└── package.json               # Local dependencies
```

### packages/solvers/

Rust-based solver nodes for intent decryption and execution.

```
solvers/
├── src/
│   ├── main.rs                # Solver entry point
│   ├── decryption.rs          # FHE decryption logic
│   ├── routing.rs             # DEX routing integration
│   ├── bundling.rs            # Transaction bundle creation
│   └── types.rs               # Shared data structures
├── tests/                     # Unit and integration tests
├── Cargo.toml                 # Dependencies (tfhe-rs, etc.)
└── config/                    # Configuration files
```

### packages/sdk/

TypeScript SDK for dApp integration.

```
sdk/
├── src/
│   ├── index.ts               # Main exports
│   ├── encrypt.ts             # Intent encryption utilities
│   ├── swap.ts                # swapPrivately function
│   ├── types.ts               # TypeScript interfaces
│   └── utils/                 # Helper functions
├── test/                      # Jest tests
├── package.json               # NPM package config
├── tsconfig.json              # TypeScript config
└── README.md                  # SDK usage documentation
```

### packages/frontend/

Next.js application with wagmi integration.

```
frontend/
├── src/
│   ├── app/                   # Next.js app router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── swap/              # Swap page
│   ├── components/            # React components
│   │   ├── SwapForm.tsx
│   │   └── WalletConnect.tsx
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and configs
│   └── types/                 # Shared types
├── public/                    # Static assets
├── package.json               # Dependencies
├── next.config.js             # Next.js config
├── tailwind.config.js         # Tailwind CSS
└── README.md
```

## Shared Configuration

### docs/

```
docs/
├── ARCHITECTURE.md            # Detailed architecture
├── API_REFERENCE.md           # SDK and contract APIs
├── DEPLOYMENT.md              # Deployment guides
├── SECURITY.md                # Security considerations
└── diagrams/                  # Mermaid diagrams
```

### scripts/

```
scripts/
├── deploy-contracts.sh        # Contract deployment
├── setup-solvers.sh           # Solver node setup
├── test-integration.sh        # Cross-package tests
└── build-all.sh               # Build all packages
```

## Development Workflow

1. **Contracts**: Use Foundry for development and testing.
2. **Solvers**: Use Cargo for Rust development.
3. **SDK**: Use TypeScript with Jest for testing.
4. **Frontend**: Use Next.js with wagmi for wallet integration.
5. **Monorepo**: Use npm/yarn workspaces for dependency management.

## File Naming Conventions

- **Contracts**: PascalCase for contracts (ShadowRouter.sol), camelCase for functions.
- **Rust**: snake_case for files and functions.
- **TypeScript**: camelCase for files, PascalCase for components.
- **Tests**: Follow respective language conventions with `.test` or `_test` suffixes.

## Dependencies

- **Shared**: ethers.js, viem for blockchain interactions.
- **Contracts**: OpenZeppelin for standards.
- **Solvers**: tfhe-rs for FHE, reqwest for HTTP.
- **SDK**: @wagmi/core, @shadowprotocol/contracts.
- **Frontend**: wagmi, @rainbow-me/rainbowkit.
