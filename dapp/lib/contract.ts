import { ethers } from 'ethers';

// Contract ABI - extracted from DocumentRegistry.sol
export const CONTRACT_ABI = [
  "function storeDocumentHash(bytes32 _documentHash, uint256 _timestamp, bytes calldata _signature, address _signer) external",
  "function verifyDocument(bytes32 _documentHash) external view returns (bool)",
  "function getDocumentInfo(bytes32 _documentHash) external view returns (bytes32 documentHash, uint256 timestamp, address signer, bytes memory signature)",
  "function isDocumentStored(bytes32 _documentHash) external view returns (bool)",
  "function getDocumentCount() external view returns (uint256)",
  "function getDocumentHashByIndex(uint256 _index) external view returns (bytes32)",
  "event DocumentStored(bytes32 indexed documentHash, uint256 timestamp, address signer)",
  "event DocumentVerified(bytes32 indexed documentHash, bool isValid)"
];

// Contract address - will be updated after deployment
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// RPC URL for connecting to local blockchain
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';

// Chain ID for local development (Anvil)
export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337');

// Default mnemonic for wallet derivation (Anvil's default)
export const MNEMONIC = process.env.NEXT_PUBLIC_MNEMONIC || 'test test test test test test test test test test test junk';

// Create provider instance
export const provider = new ethers.JsonRpcProvider(RPC_URL, {
  chainId: CHAIN_ID,
  name: 'local'
});
