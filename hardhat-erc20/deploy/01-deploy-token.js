const { network } = require("hardhat");
const {
  developmentChains,
  INITIAL_SUPPLY,
  TOKEN_NAME,
  TOKEN_SYMBOL,
} = require("../helper-hardhat-config");
const { verify } = require("../helper-functions");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("deployer is ", deployer);

  const args = [INITIAL_SUPPLY, TOKEN_NAME, TOKEN_SYMBOL];
  const token = await deploy("AllenToken", {
    from: deployer,
    args: args,
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`ROSE Token deployed at ${token.address}`);

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(token.address, args);
  }
};

module.exports.tags = ["all", "token"];
