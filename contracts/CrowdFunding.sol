// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

error CrowdFunding_AmountIsLessThenMinimumContribution();
error CrowdFunding_OnlyManagerDoThis();
error CrowdFunding_SenderIsNotAContributter();
error CrowdFunding_SenderAlredyVotedToRequest();
error CrowdFunding_RequestAlredyCompeted();
error CrowdFunding_YouCantFinalizeRequest();
error CrowdFunding_TransferFailed();

contract CrowdFunding {
    struct Request {
        string discription;
        uint256 value;
        address recipent;
        bool completed;
        uint256 approvalsCount;
        mapping(address => bool) approvals;
    }

    address private manager;
    uint256 private minmumContirbution;
    uint256 private approverCounts;
    mapping(address => bool) private approver;
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
        approver[msg.sender] = true;
        approverCounts++;
        emit UserContribute(msg.sender, msg.value);
    }

    function createRequest(
        string memory _discription,
        uint _value,
        address _recipent
    ) public restricted {
        Request storage newRequest = requests.push();
        newRequest.discription = _discription;
        newRequest.value = _value;
        newRequest.recipent = _recipent;
        newRequest.completed = false;
        newRequest.approvalsCount = 0;
    }

    function approveRequest(uint _index, bool _vote) public {
        if (!approver[msg.sender])
            revert CrowdFunding_SenderIsNotAContributter();
        Request storage request = requests[_index];
        if (!request.approvals[msg.sender])
            revert CrowdFunding_SenderAlredyVotedToRequest();

        request.approvals[msg.sender] = true;
        if (_vote) {
            request.approvalsCount = request.approvalsCount + 1;
        }
    }

    function finalizeRequest(uint _index) public restricted {
        Request storage request = requests[_index];
        if (request.completed) revert CrowdFunding_RequestAlredyCompeted();
        if (request.approvalsCount > (approverCounts / 2))
            revert CrowdFunding_YouCantFinalizeRequest();
        // request.recipent.transfer(request.value);
        (bool success, ) = payable(request.recipent).call{value: request.value}(
            ""
        );
        if (!success) {
            revert CrowdFunding_TransferFailed();
        }
        request.completed = true;
    }

    function getManger() public view returns (address) {
        return manager;
    }

    function getMinimumContribution() public view returns (uint256) {
        return minmumContirbution;
    }

    function getApproverCounts() public view returns (uint256) {
        return approverCounts;
    }
}
