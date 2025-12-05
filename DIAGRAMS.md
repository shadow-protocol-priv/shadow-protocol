# Shadow Protocol Diagrams

This document contains Mermaid diagrams illustrating the Shadow Protocol architecture and flow.

## 4-Step Flow Diagram

```mermaid
sequenceDiagram
    participant U as User Wallet
    participant R as ShadowRouter.sol
    participant S as Solver Network
    participant M as Private Mempool
    participant B as Base L2

    U->>R: 1. Submit Encrypted Intent
    Note over U,R: fhEVM encrypted blob + EIP-712 signature
    R-->>S: 2. Emit IntentSubmitted Event

    S->>S: 3. Threshold FHE Decrypt
    Note over S: 3-of-5 keys decrypt intent
    S->>S: Route via 1inch/CoW API
    S->>S: Build transaction bundle

    S->>M: 4. Submit Bundle to Private Mempool
    Note over S,M: SUAVE/Flashbots Protect
    M->>B: 5. Settle on Base L2
    Note over M,B: Normal L2 tx, unlinkable to user

    B-->>U: Tokens to User
    Note over U: Zero trace, privacy preserved
```

## Layered Architecture Diagram

```mermaid
graph TB
    subgraph User Layer
        A[Wallet/dApp Integration]
        B[Next.js + wagmi + Shadow SDK]
        C[TypeScript SDK: swapPrivately()]
    end

    subgraph Protocol Layer
        D[ShadowRouter.sol on Base]
        E[Intent Submission & Verification]
        F[Solidity + Zama fhEVM]
    end

    subgraph Execution Layer
        G[Rust Solver Nodes]
        H[Threshold FHE Decryption]
        I[DEX Routing + Bundle Creation]
        J[SUAVE/Flashbots Private Mempool]
    end

    subgraph Settlement Layer
        K[Base L2 Public Settlement]
        L[Normal Transaction Calldata]
        M[Unlinkable to User]
    end

    A --> D
    B --> D
    C --> D
    D --> G
    E --> H
    F --> I
    G --> J
    H --> J
    I --> J
    J --> K
    K --> L
    L --> M

    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style G fill:#e8f5e8
    style K fill:#fff3e0
```

## Component Interaction Diagram

```mermaid
graph LR
    subgraph Frontend
        FE[Next.js App]
        WC[Wallet Connect]
        SF[Swap Form]
    end

    subgraph SDK
        SDK[Shadow SDK]
        ENC[Encryption Module]
        SUB[Submission Module]
    end

    subgraph Contracts
        SR[ShadowRouter.sol]
        IV[IntentVerifier.sol]
        FM[FeeManager.sol]
    end

    subgraph Solvers
        SN[Solver Network]
        DEC[Decryption Service]
        RT[Routing Engine]
        BC[Bundle Creator]
    end

    subgraph Infrastructure
        RPC[Base RPC]
        DEX[DEX APIs]
        PM[Private Mempool]
    end

    FE --> WC
    FE --> SF
    SF --> SDK
    SDK --> ENC
    SDK --> SUB
    ENC --> SR
    SUB --> SR
    SR --> IV
    SR --> FM
    SN --> DEC
    SN --> RT
    SN --> BC
    DEC --> SR
    RT --> DEX
    BC --> PM
    PM --> RPC

    style FE fill:#bbdefb
    style SDK fill:#c8e6c9
    style SR fill:#ffcdd2
    style SN fill:#fff9c4
    style RPC fill:#d1c4e9
```

## Privacy Flow Diagram

```mermaid
flowchart TD
    A[User Input] --> B{Encrypt Intent}
    B --> C[Hidden: Address]
    B --> D[Hidden: Amount]
    B --> E[Hidden: Token Pair]
    B --> F[Hidden: Strategy]

    C --> G[Submit to Router]
    D --> G
    E --> G
    F --> G

    G --> H[IntentSubmitted Event]
    H --> I[Solver Decrypts]
    I --> J[Execute Trade]
    J --> K[Public Settlement]

    K --> L[Visible: Settlement Tx]
    K --> M[Hidden: User Linkage]

    style C fill:#ffcccc
    style D fill:#ffcccc
    style E fill:#ffcccc
    style F fill:#ffcccc
    style L fill:#ccffcc
    style M fill:#ffcccc
```

## Deployment Architecture Diagram

```mermaid
graph TB
    subgraph User Devices
        WEB[Web Browsers]
        MOB[Mobile Wallets]
        DAP[dApps]
    end

    subgraph Base Network
        SR2[ShadowRouter.sol]
        IV2[IntentVerifier.sol]
        FM2[FeeManager.sol]
    end

    subgraph Solver Infrastructure
        SOL1[Solver Node 1]
        SOL2[Solver Node 2]
        SOL3[Solver Node 3]
        SOL4[... N Nodes]
    end

    subgraph External Services
        ZAMA[Zama fhEVM]
        DEX2[1inch/CoW APIs]
        SUAVE[Private Mempool]
    end

    WEB --> SR2
    MOB --> SR2
    DAP --> SR2

    SR2 --> SOL1
    SR2 --> SOL2
    SR2 --> SOL3
    SR2 --> SOL4

    SOL1 --> ZAMA
    SOL2 --> ZAMA
    SOL3 --> ZAMA
    SOL4 --> ZAMA

    SOL1 --> DEX2
    SOL2 --> DEX2
    SOL3 --> DEX2
    SOL4 --> DEX2

    SOL1 --> SUAVE
    SOL2 --> SUAVE
    SOL3 --> SUAVE
    SOL4 --> SUAVE

    style WEB fill:#e3f2fd
    style SR2 fill:#f3e5f5
    style SOL1 fill:#e8f5e8
    style ZAMA fill:#fff3e0
```
