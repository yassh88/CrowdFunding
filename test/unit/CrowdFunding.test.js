const { expect, assert } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { describe } = require("node:test");
const { developmentChains } = require("../../helper-hardhat.config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("crowdFunding ", () => {
      let crowdFunding, user;
      const MIN_PRICE = ethers.utils.parseEther("0.1");
      beforeEach(async () => {
        const accounts = await ethers.getSigners();
        user = accounts[0];
        await deployments.fixture(["all"]);
        crowdFunding = await ethers.getContract("CrowdFunding");
      });
      it("check is crowdFunding successfully", async () => {
        const manager = await crowdFunding.getManger();
        const minContribution = await crowdFunding.getMinimumContribution();
        console.log("manager", manager);
        console.log("minContribution", minContribution);
        assert(minContribution.toString() === MIN_PRICE.toString());
        assert(manager === user.address);
      });
    });
