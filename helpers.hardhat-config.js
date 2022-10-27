const { ethers } = require("hardhat");

// point to the mocks or actual chainlink contract
const networkConfig = {
    // goerli
    5: {
        name: "goerli",
        surveyCreationFee: ethers.utils.parseEther("0.01"),
        interval: "30", // 30 seconds
    }, 
    31337: {
        name: "hardhat",
        surveyCreationFee: ethers.utils.parseEther("0.01"),
        interval: "30", // 30 seconds
    }
}

const developmentChains = ["hardhat", "localhost"];

module.exports = {networkConfig, developmentChains}