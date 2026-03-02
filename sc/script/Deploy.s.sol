// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/DocumentRegistry.sol";

contract DeployScript is Script {
    /// @notice Main deployment function
    function run() external {
        // Get the deployer private key from environment or use default Anvil account
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the DocumentRegistry contract
        DocumentRegistry registry = new DocumentRegistry();

        vm.stopBroadcast();

        // Log the deployed contract address
        console.log("DocumentRegistry deployed at:", address(registry));
    }
}
