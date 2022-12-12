const { expect, assert } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { describe } = require("node:test");
const { developmentChains } = require("../../helper-hardhat.config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("crowdFunding ", () => {
      let crowdFunding, user, accounts;
      const MIN_PRICE = ethers.utils.parseEther("0.1");
      beforeEach(async () => {
        accounts = await ethers.getSigners();
        user = accounts[0];
        await deployments.fixture(["all"]);
        crowdFunding = await ethers.getContract("CrowdFunding");
      });
      it("check is crowdFunding successfully", async () => {
        const manager = await crowdFunding.getManger();
        const minContribution = await crowdFunding.getMinimumContribution();
        assert(minContribution.toString() === MIN_PRICE.toString());
        assert(manager === user.address);
      });
      it("Contribution with less then min amount", async () => {
        const contributeAmount = await ethers.utils.parseEther(".05");
        const newContribution = accounts[1];
        const newContributionContributeAmount =
          crowdFunding.connect(newContribution);
        await expect(
          newContributionContributeAmount.contribute({
            value: contributeAmount,
          })
        ).to.be.revertedWith(
          "CrowdFunding_AmountIsLessThenMinimumContribution"
        );
      });
      it("Contribution with correct amount", async () => {
        const contributeAmount = await ethers.utils.parseEther(".1");
        const newContribution = accounts[1];
        const newContributionContributeAmount =
          crowdFunding.connect(newContribution);
        const tx = await newContributionContributeAmount.contribute({
          value: contributeAmount,
        });
        const txReceipt = await tx.wait(1);
        assert(
          contributeAmount.toString() ===
            txReceipt.events[0].args.amount.toString()
        );
        assert(
          newContribution.address ===
            txReceipt.events[0].args.contributer.toString()
        );
      });
      it("Create Request by other then manager", async () => {
        const amount = await ethers.utils.parseEther(".02");
        const newContribution = accounts[1];
        const recipient = accounts[2];
        const newCrowdFunding = crowdFunding.connect(newContribution);
        await expect(
          newCrowdFunding.createRequest("test", amount, recipient.address)
        ).to.be.revertedWith("CrowdFunding_OnlyManagerDoThis");
      });
      it("Create Request by the manager", async () => {
        const amount = await ethers.utils.parseEther(".02");
        const recipient = accounts[2];
        const tx = await crowdFunding.createRequest(
          "test",
          amount,
          recipient.address
        );
        const txReceipt = await tx.wait(1);
        const args = txReceipt.events[0].args;
        assert(amount.toString() === args.value.toString());
        assert(recipient.address === args.recipient);
      });
      it("Create approve by not contributed person", async () => {
        const contributeAmount = await ethers.utils.parseEther(".1");
        const newContribution = accounts[1];
        const newContribution2 = accounts[2];
        const newCrowdFunding = crowdFunding.connect(newContribution);
        await newCrowdFunding.contribute({
          value: contributeAmount,
        });
        const amount = await ethers.utils.parseEther(".02");
        const recipient = accounts[3];
        await crowdFunding.createRequest("test", amount, recipient.address);
        const newCrowdFunding2 = crowdFunding.connect(newContribution2);
        await expect(newCrowdFunding2.approveRequest(0)).to.be.revertedWith(
          "CrowdFunding_SenderIsNotAContributed"
        );
      });
      it("Create approve by contributed person", async () => {
        const contributeAmount = await ethers.utils.parseEther(".1");
        const newContribution = accounts[1];
        const newCrowdFunding = crowdFunding.connect(newContribution);
        await newCrowdFunding.contribute({
          value: contributeAmount,
        });
        const amount = await ethers.utils.parseEther(".02");
        const recipient = accounts[3];
        await crowdFunding.createRequest("test", amount, recipient.address);
        const tx = await newCrowdFunding.approveRequest(0);
        const txReceipt = await tx.wait(1);
        const args = txReceipt.events[0].args;
        assert(args.approver === newContribution.address);
      });
      it("duplicate approve by contributed person", async () => {
        const contributeAmount = await ethers.utils.parseEther(".1");
        const newContribution = accounts[1];
        const newCrowdFunding = crowdFunding.connect(newContribution);
        await newCrowdFunding.contribute({
          value: contributeAmount,
        });
        const amount = await ethers.utils.parseEther(".02");
        const recipient = accounts[3];
        await crowdFunding.createRequest("test", amount, recipient.address);
        await newCrowdFunding.approveRequest(0);
        await expect(newCrowdFunding.approveRequest(0)).to.be.revertedWith(
          "CrowdFunding_SenderAlredyVotedToRequest"
        );
      });
      it("finalize successfully request", async () => {
        const contributeAmount = await ethers.utils.parseEther(".1");
        const newContribution = accounts[1];
        const newCrowdFunding = crowdFunding.connect(newContribution);
        await newCrowdFunding.contribute({
          value: contributeAmount,
        });
        const amount = await ethers.utils.parseEther(".02");
        const recipient = accounts[3];
        await crowdFunding.createRequest("test", amount, recipient.address);
        await newCrowdFunding.approveRequest(0);
        const tx = await crowdFunding.finalizeRequest(0);
        const txReceipt = await tx.wait(1);
        const args = txReceipt.events[0].args;
        assert(args.recipent === recipient.address);
      });
      it("finalize request without approve", async () => {
        const contributeAmount = await ethers.utils.parseEther(".1");
        const newContribution = accounts[1];
        const newCrowdFunding = crowdFunding.connect(newContribution);
        await newCrowdFunding.contribute({
          value: contributeAmount,
        });
        const amount = await ethers.utils.parseEther(".02");
        const recipient = accounts[3];
        await crowdFunding.createRequest("test", amount, recipient.address);
        await expect(crowdFunding.finalizeRequest(0)).to.be.revertedWith(
          "CrowdFunding_YouCantFinalizeRequest"
        );
      });
      it("finalize request without manager", async () => {
        const contributeAmount = await ethers.utils.parseEther(".1");
        const newContribution = accounts[1];
        const newCrowdFunding = crowdFunding.connect(newContribution);
        await newCrowdFunding.contribute({
          value: contributeAmount,
        });
        const amount = await ethers.utils.parseEther(".02");
        const recipient = accounts[3];
        await crowdFunding.createRequest("test", amount, recipient.address);
        await expect(newCrowdFunding.finalizeRequest(0)).to.be.revertedWith(
          "CrowdFunding_OnlyManagerDoThis"
        );
      });
      it("finalize duplicate request", async () => {
        const contributeAmount = await ethers.utils.parseEther(".1");
        const newContribution = accounts[1];
        const newCrowdFunding = crowdFunding.connect(newContribution);
        await newCrowdFunding.contribute({
          value: contributeAmount,
        });
        const amount = await ethers.utils.parseEther(".02");
        const recipient = accounts[3];
        await crowdFunding.createRequest("test", amount, recipient.address);
        await newCrowdFunding.approveRequest(0);
        await crowdFunding.finalizeRequest(0);
        await expect(crowdFunding.finalizeRequest(0)).to.be.revertedWith(
          "CrowdFunding_RequestAlreadyCompeted"
        );
      });
      it("finalize duplicate request", async () => {
        const contributeAmount = await ethers.utils.parseEther(".1");
        const newContribution = accounts[1];
        const newCrowdFunding = crowdFunding.connect(newContribution);
        await newCrowdFunding.contribute({
          value: contributeAmount,
        });
        const approverCounts = await crowdFunding.getApproverCounts();
        console.log("approverCounts--", approverCounts);
        assert(approverCounts.toString() === "1");
      });
    });
