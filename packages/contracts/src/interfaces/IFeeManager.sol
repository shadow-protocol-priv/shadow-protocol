// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface IFeeManager {
    function calculateFee(uint256 amount) external view returns (uint256);
    function distributeFees(address solver, uint256 totalFee) external;
    function withdrawTreasury() external;
}
