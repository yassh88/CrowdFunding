const networkConfig = {
  5: {
    name: "goerli",
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", // 30 gwei
  },

  31337: {
    name: "localhost",
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
  },
};

const developmentChains = ["localhost", "hardhat"];

const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
module.exports = {
  networkConfig,
  developmentChains,
  VERIFICATION_BLOCK_CONFIRMATIONS,
};
