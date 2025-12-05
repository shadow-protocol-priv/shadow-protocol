// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IFeeManager.sol";

contract FeeManager is IFeeManager, Ownable(msg.sender) {
    uint256 public constant FEE_BPS = 1000; // 10% = 1000 bps
    uint256 public constant SOLVER_SHARE_BPS = 500; // 5% = 500 bps
    uint256 public constant TREASURY_SHARE_BPS = 500; // 5% = 500 bps

    uint256 public treasuryBalance;

    event FeesDistributed(
        address indexed solver,
        uint256 solverFee,
        uint256 treasuryFee
    );
    event TreasuryWithdrawn(address indexed to, uint256 amount);

    function calculateFee(uint256 amount) external pure returns (uint256) {
        return (amount * FEE_BPS) / 10000;
    }

    function distributeFees(address solver, uint256 totalFee) external {
        uint256 solverFee = (totalFee * SOLVER_SHARE_BPS) / 10000;
        uint256 treasuryFee = (totalFee * TREASURY_SHARE_BPS) / 10000;

        // Transfer solver fee immediately
        payable(solver).transfer(solverFee);

        // Accumulate treasury fee
        treasuryBalance += treasuryFee;

        emit FeesDistributed(solver, solverFee, treasuryFee);
    }

    function withdrawTreasury() external onlyOwner {
        uint256 amount = treasuryBalance;
        require(amount > 0, "No treasury funds");

        treasuryBalance = 0;
        payable(owner()).transfer(amount);

        emit TreasuryWithdrawn(owner(), amount);
    }

    function getTreasuryBalance() external view returns (uint256) {
        return treasuryBalance;
    }

    // Emergency function to receive ETH
    receive() external payable {}
}
