// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

error CrowdFunding_AmountIsLessThenMinimumContribution();
error CrowdFunding_OnlyManagerDoThis();

contract CrowdFunding {
    struct Request {
        string discription;
        uint256 value;
        address recipent;
        uint completed;
    }

    address private manager;
    uint256 private minmumContirbution;
    address[] private approver;
    Request[] private requests;

    event UserContribute(address indexed contributer, uint256 amount);

    modifier restricted() {
        if (msg.sender != manager) {
            revert CrowdFunding_OnlyManagerDoThis();
        }
        _;
    }

    constructor(uint _minmumContirbution) {
        minmumContirbution = _minmumContirbution;
        manager = msg.sender;
    }

    function contribute() public payable {
        if (msg.value < minmumContirbution) {
            revert CrowdFunding_AmountIsLessThenMinimumContribution();
        }
        approver.push(msg.sender);
        emit UserContribute(msg.sender, msg.value);
    }

    function createRequest(
        string memory _discription,
        uint value,
        address recipent
    ) restricted {
        requests.push();
    }

    // function approveRequest() returns () {}

    // function finalizeRequest() returns () {}
}
