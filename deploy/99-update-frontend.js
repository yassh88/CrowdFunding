const { network, ethers } = require("hardhat");
const fs = require("fs");

const ABI_FILE = "../ui-crowd-funding/crowd-funding/constants/abi.json";
const ADDRESS_FILE =
  "../ui-crowd-funding/crowd-funding/constants/contract-address.json";
module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    await updateContractAddress();
    await updateContractABI();
    console.log("-----UI ABI 0---");
  }
};
async function updateContractABI() {
  console.log("-----updateContractABI");
  const crowdFunding = await ethers.getContract("CrowdFunding");
  console.log("-----updateContractABI");
  console.log("-----UI ABI--- crowdFunding");
  fs.writeFileSync(
    ABI_FILE,
    crowdFunding.interface.format(ethers.utils.FormatTypes.json)
  );
  console.log("-----UI ABI--- ABI");
}
async function updateContractAddress() {
  console.log("-----updateContractAddress");
  const crowdFunding = await ethers.getContract("CrowdFunding");
  console.log("-----UI ABI--- crowdFunding1");
  const chainId = network.config.chainId.toString();
  const currentAddress = JSON.parse(fs.readFileSync(ADDRESS_FILE, "utf8"));
  console.log("-----currentAddress--- ", currentAddress);
  if (chainId in currentAddress) {
    if (!currentAddress[chainId].includes(crowdFunding.address)) {
      currentAddress[chainId].push(crowdFunding.address);
    }
  } else {
    currentAddress[chainId] = [crowdFunding.address];
  }
  fs.writeFileSync(ADDRESS_FILE, JSON.stringify(currentAddress));
  console.log("-----UI ABI--- address");
}
module.exports.tags = ["frontend"];
