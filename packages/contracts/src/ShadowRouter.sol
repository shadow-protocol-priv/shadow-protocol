// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IShadowRouter.sol";
import "./interfaces/IIntentVerifier.sol";
import "./interfaces/IFeeManager.sol";
import "./types/Intent.sol";

contract ShadowRouter is IShadowRouter, Ownable(msg.sender), ReentrancyGuard {
    IIntentVerifier public immutable verifier;
    IFeeManager public immutable feeManager;

    mapping(bytes32 => IntentStatus) public intentStatuses;
    mapping(bytes32 => Intent) public intents;
    mapping(bytes32 => address) public intentSolvers;

    uint256 public constant FEE_BPS = 1000; // 10%

    event IntentExpired(bytes32 indexed intentHash);

    constructor(address _verifier, address _feeManager) {
        verifier = IIntentVerifier(_verifier);
        feeManager = IFeeManager(_feeManager);
    }

    function submitIntent(
        Intent calldata intent
    ) external returns (bytes32 intentHash) {
        require(block.timestamp <= intent.deadline, "Intent expired");
        require(verifier.verifyIntentSignature(intent), "Invalid signature");

        intentHash = keccak256(abi.encode(intent));
        require(
            intentStatuses[intentHash] == IntentStatus.Pending,
            "Intent already exists"
        );

        intents[intentHash] = intent;
        intentStatuses[intentHash] = IntentStatus.Pending;

        emit IntentSubmitted(intentHash, intent.user, intent.encryptedData);
    }

    function fulfillIntent(
        Fulfillment calldata fulfillment
    ) external nonReentrant {
        bytes32 intentHash = fulfillment.intentHash;
        require(
            intentStatuses[intentHash] == IntentStatus.Pending,
            "Intent not pending"
        );
        require(verifier.isValidSolver(msg.sender), "Unauthorized solver");
        require(
            verifier.verifyExecutionProof(
                fulfillment.proof,
                intentHash,
                fulfillment.executionData
            ),
            "Invalid proof"
        );

        Intent memory intent = intents[intentHash];
        require(block.timestamp <= intent.deadline, "Intent expired");

        // Execute the settlement transaction
        (bool success, ) = address(this).call(fulfillment.executionData);
        require(success, "Execution failed");

        // Calculate and distribute fees
        uint256 fee = feeManager.calculateFee(
            _extractAmount(fulfillment.executionData)
        );
        feeManager.distributeFees(msg.sender, fee);

        intentStatuses[intentHash] = IntentStatus.Fulfilled;
        intentSolvers[intentHash] = msg.sender;

        emit IntentFulfilled(intentHash, msg.sender, fee);
    }

    function cancelIntent(bytes32 intentHash) external {
        Intent memory intent = intents[intentHash];
        require(intent.user == msg.sender, "Not intent owner");
        require(
            intentStatuses[intentHash] == IntentStatus.Pending,
            "Cannot cancel"
        );
        require(block.timestamp > intent.deadline, "Intent not expired");

        intentStatuses[intentHash] = IntentStatus.Cancelled;

        emit IntentCancelled(intentHash);
    }

    function getIntentStatus(
        bytes32 intentHash
    ) external view returns (IntentStatus) {
        IntentStatus status = intentStatuses[intentHash];

        // Auto-expire intents
        if (
            status == IntentStatus.Pending &&
            block.timestamp > intents[intentHash].deadline
        ) {
            return IntentStatus.Expired;
        }

        return status;
    }

    // Internal function to extract amount from execution data (simplified)
    function _extractAmount(
        bytes memory executionData
    ) internal pure returns (uint256) {
        // This is a placeholder - in reality, you'd parse the swap amount from the calldata
        // For now, assume a fixed amount for MVP
        return 1 ether;
    }

    // Test function
    function dummy() external pure returns (bool) {
        return true;
    }

    // Emergency functions
    function pause() external onlyOwner {
        // Implement pause functionality
    }

    function unpause() external onlyOwner {
        // Implement unpause functionality
    }
}
