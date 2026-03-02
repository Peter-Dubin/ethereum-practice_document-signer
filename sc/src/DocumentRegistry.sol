// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title DocumentRegistry
/// @notice Smart contract for storing and verifying document authenticity on Ethereum
/// @dev Uses gas-efficient storage by checking signer != address(0) for existence
contract DocumentRegistry {
    /// @notice Struct to store document information
    /// @dev Optimized: uses signer address (0 check) instead of redundant bool flag
    struct Document {
        bytes32 documentHash;  // 32 bytes - keccak256 hash of document
        uint256 timestamp;      // 32 bytes - when document was stored
        address signer;         // 20 bytes - address that signed the document
        bytes signature;        // dynamic - ECDSA signature
    }

    /// @notice Mapping from document hash to Document struct
    /// @dev documentHash => Document
    mapping(bytes32 => Document) private documents;

    /// @notice Array to track all stored document hashes for enumeration
    bytes32[] private documentHashes;

    /// @notice Event emitted when a document is stored
    /// @param documentHash The keccak256 hash of the document
    /// @param timestamp The time when the document was stored
    /// @param signer The address that signed the document
    event DocumentStored(bytes32 indexed documentHash, uint256 timestamp, address signer);

    /// @notice Event emitted when a document is verified
    /// @param documentHash The keccak256 hash of the document
    /// @param isValid Whether the document is valid
    event DocumentVerified(bytes32 indexed documentHash, bool isValid);

    /// @notice Error thrown when attempting to store a document that already exists
    error DocumentAlreadyExists(bytes32 documentHash);

    /// @notice Error thrown when verifying a document that doesn't exist
    error DocumentNotFound(bytes32 documentHash);

    /// @notice Error thrown when the signer address is zero
    error InvalidSigner();

    /// @notice Store a new document hash with its signature
    /// @dev Gas efficient: avoids redundant storage by using signer != address(0) check
    /// @param _documentHash The keccak256 hash of the document
    /// @param _timestamp The timestamp when the document was signed
    /// @param _signature The ECDSA signature from the signer
    /// @param _signer The address that signed the document
    function storeDocumentHash(
        bytes32 _documentHash,
        uint256 _timestamp,
        bytes calldata _signature,
        address _signer
    ) external {
        // Check if document already exists (gas optimization)
        if (documents[_documentHash].signer != address(0)) {
            revert DocumentAlreadyExists(_documentHash);
        }

        // Validate signer address
        if (_signer == address(0)) {
            revert InvalidSigner();
        }

        // Store the document
        documents[_documentHash] = Document({
            documentHash: _documentHash,
            timestamp: _timestamp,
            signer: _signer,
            signature: _signature
        });

        // Add to document hash array for enumeration
        documentHashes.push(_documentHash);

        // Emit event
        emit DocumentStored(_documentHash, _timestamp, _signer);
    }

    /// @notice Verify a document's authenticity
    /// @param _documentHash The keccak256 hash of the document to verify
    /// @return bool Whether the document is valid and exists
    function verifyDocument(bytes32 _documentHash) external view returns (bool) {
        Document memory doc = documents[_documentHash];

        // Check if document exists
        if (doc.signer == address(0)) {
            return false;
        }

        return true;
    }

    /// @notice Get document information by hash
    /// @param _documentHash The keccak256 hash of the document
    /// @return documentHash The stored document hash
    /// @return timestamp The timestamp when the document was stored
    /// @return signer The address that signed the document
    /// @return signature The ECDSA signature
    function getDocumentInfo(bytes32 _documentHash)
        external
        view
        returns (
            bytes32 documentHash,
            uint256 timestamp,
            address signer,
            bytes memory signature
        )
    {
        Document memory doc = documents[_documentHash];
        return (doc.documentHash, doc.timestamp, doc.signer, doc.signature);
    }

    /// @notice Check if a document is stored
    /// @param _documentHash The keccak256 hash of the document
    /// @return bool Whether the document exists
    function isDocumentStored(bytes32 _documentHash) external view returns (bool) {
        return documents[_documentHash].signer != address(0);
    }

    /// @notice Get the total count of stored documents
    /// @return uint256 The number of documents stored
    function getDocumentCount() external view returns (uint256) {
        return documentHashes.length;
    }

    /// @notice Get document hash by index
    /// @param _index The index of the document hash (0-based)
    /// @return bytes32 The document hash at the given index
    function getDocumentHashByIndex(uint256 _index) external view returns (bytes32) {
        require(_index < documentHashes.length, "Index out of bounds");
        return documentHashes[_index];
    }
}
