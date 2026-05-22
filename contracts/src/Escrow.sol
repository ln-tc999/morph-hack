// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Escrow {
    IERC20 public immutable usdc;
    address public immutable owner;

    struct Lock {
        address client;
        address agent;
        uint256 amount;
        bool released;
        bool refunded;
    }

    mapping(bytes32 => Lock) public locks;

    event Deposited(bytes32 indexed lockId, address indexed client, address indexed agent, uint256 amount);
    event Released(bytes32 indexed lockId, address indexed agent, uint256 amount);
    event Refunded(bytes32 indexed lockId, address indexed client, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Escrow: not owner");
        _;
    }

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }

    function deposit(address agent, uint256 amount) external returns (bytes32 lockId) {
        require(agent != address(0), "Escrow: invalid agent");
        require(amount > 0, "Escrow: zero amount");

        lockId = keccak256(abi.encodePacked(msg.sender, agent, block.timestamp));
        locks[lockId] = Lock({client: msg.sender, agent: agent, amount: amount, released: false, refunded: false});

        require(usdc.transferFrom(msg.sender, address(this), amount), "Escrow: transfer failed");

        emit Deposited(lockId, msg.sender, agent, amount);
    }

    function release(bytes32 lockId) external {
        Lock storage lock = locks[lockId];
        require(lock.amount > 0, "Escrow: lock not found");
        require(!lock.released, "Escrow: already released");
        require(!lock.refunded, "Escrow: already refunded");
        require(msg.sender == lock.client || msg.sender == owner, "Escrow: not authorized");

        lock.released = true;
        require(usdc.transfer(lock.agent, lock.amount), "Escrow: transfer failed");

        emit Released(lockId, lock.agent, lock.amount);
    }

    function refund(bytes32 lockId) external {
        Lock storage lock = locks[lockId];
        require(lock.amount > 0, "Escrow: lock not found");
        require(!lock.released, "Escrow: already released");
        require(!lock.refunded, "Escrow: already refunded");
        require(msg.sender == lock.client || msg.sender == owner, "Escrow: not authorized");

        lock.refunded = true;
        require(usdc.transfer(lock.client, lock.amount), "Escrow: transfer failed");

        emit Refunded(lockId, lock.client, lock.amount);
    }

    function getLock(bytes32 lockId) external view returns (Lock memory) {
        return locks[lockId];
    }
}
