const { network } = require("hardhat");
const {developmentChains, networkConfig} = require("../helpers.hardhat-config");
const {verify} = require("../utils/verify");

module.exports = async function({getNamedAccounts, deployments}){
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    const interval = networkConfig[chainId]["interval"];
    const surveyCreationFee = networkConfig[chainId]["surveyCreationFee"];

    log("Deploying Surpay contract")
    const args = [surveyCreationFee, interval];
    const surpay = await deploy("Surpay", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (network.name == "goerli" && process.env.ETHERSCAN_API_KEY){
        log("Verifying on etherscan...");
        await verify(surpay.address, args);
    } 
    if (network.name === "mumbai" && process.env.POLYSCAN_API_KEY) {
        log("Verifying on polyscan...");
        await verify(surpay.address, args);
    }
    log("Surpay Contract Deployed!")
    log("----------------------------------------------");
}

module.exports.tags = ["all", "surpay"];