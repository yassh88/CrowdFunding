const { network } = require("hardhat");
const {
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat.config");
const { verify } = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const PRICE = ethers.utils.parseEther("0.1");

  const arguments = [PRICE];
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;
  const crowdFunding = await deploy("CrowdFunding", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(crowdFunding.address, arguments);
  }
};

module.exports.tags = ["all", "crowdFunding"];
