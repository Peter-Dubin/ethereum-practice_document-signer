# DocumentRegistry Smart Contract

Ethereum smart contract for storing and verifying document authenticity on the blockchain.

## Overview

The `DocumentRegistry` contract allows users to:
- Store document hashes (keccak256) on the Ethereum blockchain
- Verify the authenticity of documents
- Track all stored documents with timestamps and signer information

## Contract Details

- **Language**: Solidity ^0.8.0
- **License**: MIT

## Contract Functions

### Core Functions

```solidity
// Store a new document hash with signature
function storeDocumentHash(
    bytes32 _documentHash,
    uint256 _timestamp,
    bytes calldata _signature,
    address _signer
) external

// Verify if a document exists
function verifyDocument(bytes32 _documentHash) external view returns (bool)

// Get full document information
function getDocumentInfo(bytes32 _documentHash) external view returns (
    bytes32 documentHash,
    uint256 timestamp,
    address signer,
    bytes memory signature
)

// Check if document is stored
function isDocumentStored(bytes32 _documentHash) external view returns (bool)

// Get total document count
function getDocumentCount() external view returns (uint256)

// Get document hash by index
function getDocumentHashByIndex(uint256 _index) external view returns (bytes32)
```

### Events

```solidity
event DocumentStored(bytes32 indexed documentHash, uint256 timestamp, address signer)
event DocumentVerified(bytes32 indexed documentHash, bool isValid)
```

### Errors

```solidity
error DocumentAlreadyExists(bytes32 documentHash)
error DocumentNotFound(bytes32 documentHash)
error InvalidSigner()
```

## Storage Optimization

The contract uses gas-efficient storage patterns:
- No redundant `exists` field in struct (uses `signer != address(0)` check)
- No redundant mapping for existence check

## Setup

### Install Dependencies

```bash
forge install
```

### Build

```bash
forge build
```

### Run Tests

```bash
forge test
```

Expected output: 12 tests passing

### Deploy to Anvil

```bash
# Start Anvil
anvil

# Deploy contract
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

## Usage with Cast

### Store a document

```bash
cast send <CONTRACT_ADDRESS> "storeDocumentHash(bytes32,uint256,bytes,address)" \
  <DOCUMENT_HASH> <TIMESTAMP> <SIGNATURE> <SIGNER_ADDRESS> \
  --private-key <PRIVATE_KEY>
```

### Verify a document

```bash
cast call <CONTRACT_ADDRESS> "verifyDocument(bytes32)" <DOCUMENT_HASH>
```

### Get document info

```bash
cast call <CONTRACT_ADDRESS> "getDocumentInfo(bytes32)" <DOCUMENT_HASH>
```

## Gas Optimization

The contract is optimized for gas efficiency:
- Uses `signer != address(0)` instead of boolean flag
- No separate existence mapping
- Efficient struct design with minimal storage slots

## Project Structure

```
sc/
├── src/
│   └── DocumentRegistry.sol    # Main contract
├── test/
│   └── DocumentRegistry.t.sol # Contract tests
├── script/
│   └── Deploy.s.sol           # Deployment script
├── lib/
│   └── forge-std/            # Foundry standard library
└── foundry.toml              # Foundry configuration
```
