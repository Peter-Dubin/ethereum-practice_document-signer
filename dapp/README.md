# Document Signer - Ethereum dApp

A decentralized application for storing and verifying document authenticity using Ethereum blockchain.

## Features

- **Document Signing**: Upload any file and sign it with an Ethereum wallet
- **Document Verification**: Verify if a document has been stored on the blockchain
- **Document History**: View all documents stored on the blockchain
- **Multi-wallet Support**: Select from multiple derived wallets for signing

## Tech Stack

- **Smart Contract**: Solidity with Foundry
- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Ethereum (local Anvil for development)

## Prerequisites

- Node.js 18+
- Foundry (for smart contract development)
- Anvil (local blockchain)

## Installation

### Smart Contract (Foundry)

```bash
cd sc
forge install
forge build
```

### Frontend (Next.js)

```bash
cd dapp
npm install
```

## Running the Application

### 1. Start Anvil (Local Blockchain)

```bash
# In one terminal
cd sc
anvil
```

### 2. Deploy the Smart Contract

```bash
# In another terminal
cd sc
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

### 3. Start the Frontend

```bash
# In the dapp directory
cd dapp
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

The application uses the following environment variables (already configured in `.env.local`):

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| `NEXT_PUBLIC_RPC_URL` | Blockchain RPC URL | `http://localhost:8545` |
| `NEXT_PUBLIC_CHAIN_ID` | Chain ID for local dev | `31337` |
| `NEXT_PUBLIC_MNEMONIC` | Wallet mnemonic | `test test test test test test test test test test test junk` |

## Smart Contract

The `DocumentRegistry.sol` contract provides:

- `storeDocumentHash(bytes32, uint256, bytes, address)`: Store a document hash on-chain
- `verifyDocument(bytes32)`: Verify if a document exists
- `getDocumentInfo(bytes32)`: Get document details
- `getDocumentCount()`: Get total document count
- `getDocumentHashByIndex(uint256)`: Get document hash by index

### Running Tests

```bash
cd sc
forge test
```

## Project Structure

```
document_signer/
├── sc/                    # Smart contracts (Foundry)
│   ├── src/
│   │   └── DocumentRegistry.sol
│   ├── test/
│   │   └── DocumentRegistry.t.sol
│   └── script/
│       └── Deploy.s.sol
├── dapp/                  # Frontend (Next.js)
│   ├── app/
│   │   ├── page.tsx       # Main page with tabs
│   │   └── layout.tsx     # Root layout with providers
│   ├── components/
│   │   ├── FileUploader.tsx
│   │   ├── DocumentSigner.tsx
│   │   ├── DocumentVerifier.tsx
│   │   └── DocumentHistory.tsx
│   ├── contexts/
│   │   └── WalletContext.tsx
│   ├── hooks/
│   │   └── useContract.ts
│   └── lib/
│       └── contract.ts
└── plans/
    └── TAREA PARA ESTUDIANTE.md
```

## Usage

1. **Select Wallet**: Choose from the wallet dropdown (Anvil test wallets)
2. **Upload Document**: Drag and drop or click to upload a file
3. **Sign**: Click "Sign Document" to create a cryptographic signature
4. **Store**: Click "Store on Blockchain" to store the document hash
5. **Verify**: Switch to "Verify" tab to verify documents
6. **History**: View all stored documents in the "History" tab

## License

MIT
