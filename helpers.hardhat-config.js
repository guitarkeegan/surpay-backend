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
        surveyId: ["1", "2"],
        companyId: ["1", "2"],
        totalPayoutAmount: ethers.utils.parseEther("0.11"), // payout + entrance fee
        numOfParticipantsDesired: 2,
        surveyResponseData: ["Joe Smith, 1234 Cupcake Dr., My favorite color is red.", "Mary Jane, 4321 Spider St., My favorite colors are red and white.. like spidey!!"]
    }
}

const developmentChains = ["hardhat", "localhost"];

module.exports = {networkConfig, developmentChains}