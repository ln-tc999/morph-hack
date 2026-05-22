// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract x402Facilitator {
    IERC20 public immutable usdc;
    address public immutable owner;

    struct PaymentIntent {
        address payer;
        address payee;
        uint256 amount;
        bytes32 paymentId;
        bool settled;
    }

    mapping(bytes32 => PaymentIntent) public intents;

    event IntentCreated(bytes32 indexed intentId, address indexed payee, uint256 amount);
    event IntentSettled(bytes32 indexed intentId, address indexed payer, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "x402: not owner");
        _;
    }

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }

    function createIntent(address payee, uint256 amount) external returns (bytes32 intentId) {
        require(payee != address(0), "x402: invalid payee");
        require(amount > 0, "x402: zero amount");

        intentId = keccak256(abi.encodePacked(msg.sender, payee, amount, block.timestamp));
        intents[intentId] = PaymentIntent({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            paymentId: intentId,
            settled: false
        });

        emit IntentCreated(intentId, payee, amount);
    }

    function settle(bytes32 intentId) external {
        PaymentIntent storage intent = intents[intentId];
        require(intent.amount > 0, "x402: intent not found");
        require(!intent.settled, "x402: already settled");
        require(msg.sender == intent.payer || msg.sender == owner, "x402: not authorized");

        intent.settled = true;
        require(usdc.transferFrom(intent.payer, intent.payee, intent.amount), "x402: transfer failed");

        emit IntentSettled(intentId, intent.payer, intent.amount);
    }

    function getIntent(bytes32 intentId) external view returns (PaymentIntent memory) {
        return intents[intentId];
    }
}
