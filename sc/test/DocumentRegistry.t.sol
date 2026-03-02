// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/DocumentRegistry.sol";

contract DocumentRegistryTest is Test {
    DocumentRegistry public registry;

    address public signer = address(0x123);
    address public otherSigner = address(0x456);

    bytes32 public testHash = bytes32(uint256(1));
    bytes32 public anotherHash = bytes32(uint256(2));

    bytes public testSignature = bytes("test signature");

    uint256 public testTimestamp = block.timestamp;

    /// @notice Set up the test environment
    function setUp() public {
        registry = new DocumentRegistry();
    }

    /// @notice Test storing a new document successfully
    function testStoreDocumentHash() public {
        vm.prank(signer);
        registry.storeDocumentHash(testHash, testTimestamp, testSignature, signer);

        // Verify the document was stored
        assertTrue(registry.isDocumentStored(testHash));

        // Verify document info
        (bytes32 hash, uint256 timestamp, address storedSigner, bytes memory signature) = registry
            .getDocumentInfo(testHash);

        assertEq(hash, testHash);
        assertEq(timestamp, testTimestamp);
        assertEq(storedSigner, signer);
        assertEq(signature, testSignature);
    }

    /// @notice Test storing a duplicate document fails
    function testStoreDuplicateDocument() public {
        vm.prank(signer);
        registry.storeDocumentHash(testHash, testTimestamp, testSignature, signer);

        // Attempt to store the same document again
        vm.prank(signer);
        vm.expectRevert(abi.encodeWithSignature("DocumentAlreadyExists(bytes32)", testHash));
        registry.storeDocumentHash(testHash, testTimestamp, testSignature, signer);
    }

    /// @notice Test verifying an existing document
    function testVerifyDocument() public {
        vm.prank(signer);
        registry.storeDocumentHash(testHash, testTimestamp, testSignature, signer);

        // Verify the document
        bool isValid = registry.verifyDocument(testHash);
        assertTrue(isValid);
    }

    /// @notice Test verifying a non-existent document
    function testVerifyNonExistentDocument() public {
        bool isValid = registry.verifyDocument(testHash);
        assertFalse(isValid);
    }

    /// @notice Test storing with invalid signer (address(0))
    function testStoreWithInvalidSigner() public {
        vm.prank(signer);
        vm.expectRevert(abi.encodeWithSignature("InvalidSigner()"));
        registry.storeDocumentHash(testHash, testTimestamp, testSignature, address(0));
    }

    /// @notice Test document count increment
    function testDocumentCount() public {
        assertEq(registry.getDocumentCount(), 0);

        vm.prank(signer);
        registry.storeDocumentHash(testHash, testTimestamp, testSignature, signer);

        assertEq(registry.getDocumentCount(), 1);

        vm.prank(otherSigner);
        registry.storeDocumentHash(anotherHash, testTimestamp, testSignature, otherSigner);

        assertEq(registry.getDocumentCount(), 2);
    }

    /// @notice Test getting document hash by index
    function testGetDocumentHashByIndex() public {
        vm.prank(signer);
        registry.storeDocumentHash(testHash, testTimestamp, testSignature, signer);

        vm.prank(otherSigner);
        registry.storeDocumentHash(anotherHash, testTimestamp, testSignature, otherSigner);

        assertEq(registry.getDocumentHashByIndex(0), testHash);
        assertEq(registry.getDocumentHashByIndex(1), anotherHash);
    }

    /// @notice Test getting document hash by index with invalid index
    function testGetDocumentHashByIndexOutOfBounds() public {
        vm.prank(signer);
        registry.storeDocumentHash(testHash, testTimestamp, testSignature, signer);

        vm.expectRevert("Index out of bounds");
        registry.getDocumentHashByIndex(5);
    }

    /// @notice Test multiple documents from different signers
    function testMultipleSigners() public {
        vm.prank(signer);
        registry.storeDocumentHash(testHash, testTimestamp, testSignature, signer);

        vm.prank(otherSigner);
        registry.storeDocumentHash(anotherHash, testTimestamp, testSignature, otherSigner);

        // Verify both documents exist
        assertTrue(registry.isDocumentStored(testHash));
        assertTrue(registry.isDocumentStored(anotherHash));

        // Verify each signer's document
        (, , address storedSigner, ) = registry.getDocumentInfo(testHash);
        assertEq(storedSigner, signer);

        (, , address otherStoredSigner, ) = registry.getDocumentInfo(anotherHash);
        assertEq(otherStoredSigner, otherSigner);
    }
}
