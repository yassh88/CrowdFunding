// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

// error CrowdFunding_AmountIsLessThenMinimumContribution();
// error CrowdFunding_OnlyManagerDoThis();
// error CrowdFunding_SenderIsNotAContributter();
// error CrowdFunding_SenderAlredyVotedToRequest();
// error CrowdFunding_RequestAlredyCompeted();
// error CrowdFunding_YouCantFinalizeRequest();
// error CrowdFunding_TransferFailed();

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
    event requestIsCreated(uint256 indexed value, address recipient);
    event requestApproved(address indexed approver);
    event amountTransferedToRecipent(address indexed recipent);
    modifier restricted() {
        if (msg.sender != manager) {
            revert("CrowdFunding_OnlyManagerDoThis");
        }
        _;
    }

    constructor(uint _minmumContirbution) {
        minmumContirbution = _minmumContirbution;
        manager = msg.sender;
    }

    function contribute() public payable {
        if (msg.value < minmumContirbution) {
            console.log("reverted");
            revert("CrowdFunding_AmountIsLessThenMinimumContribution");
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
        console.log("its called");
        Request storage newRequest = requests.push();
        newRequest.discription = _discription;
        newRequest.value = _value;
        newRequest.recipent = _recipent;
        newRequest.completed = false;
        newRequest.approvalsCount = 0;
        console.log("its value", _value);
        console.log("its recipent", _recipent);

        emit requestIsCreated(_value, _recipent);
    }

    function approveRequest(uint _index) public {
        if (!approver[msg.sender])
            revert("CrowdFunding_SenderIsNotAContributed");
        Request storage request = requests[_index];
        console.log("request");
        console.log(request.approvals[msg.sender]);
        if (request.approvals[msg.sender])
            revert("CrowdFunding_SenderAlredyVotedToRequest");
        request.approvals[msg.sender] = true;
        request.approvalsCount = request.approvalsCount + 1;
        console.log("doen");
        emit requestApproved(msg.sender);
    }

    function finalizeRequest(uint _index) public restricted {
        Request storage request = requests[_index];
        if (request.completed) revert("CrowdFunding_RequestAlreadyCompeted");
        if (request.approvalsCount <= (approverCounts / 2))
            revert("CrowdFunding_YouCantFinalizeRequest");
        (bool success, ) = payable(request.recipent).call{value: request.value}(
            ""
        );
        if (!success) {
            revert("CrowdFunding_TransferFailed");
        }
        request.completed = true;
        emit amountTransferedToRecipent(request.recipent);
    }

    function getManger() public view returns (address) {
        return manager;
    }

    function getMinimumContribution() public view returns (uint256) {
        return minmumContirbution;
    }

    function getApproverCounts() public view returns (uint256) {
        console.log("approverCounts", approverCounts);
        return approverCounts;
    }

    function getCountRequests() public view returns (uint256) {
        console.log("approverCounts", approverCounts);
        return requests.length;
    }
}
