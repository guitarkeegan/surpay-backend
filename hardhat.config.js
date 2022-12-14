require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

// .env variables

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://goerli.example.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "hi there"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "what up";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "nice one!";
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "mumbai!";
const POLYSCAN_API_KEY = process.env.POLYSCAN_API_KEY || "polywhaa?"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    goerli: {
      chainId: 5,
      blockConfirmations: 6,
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY]
    }, 
    mumbai: {
      chainId: 80001,
      blockConfirmations: 6,
      url: MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
      polygonMumbai: POLYSCAN_API_KEY
    }
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC"
  },
  solidity: "0.8.17",
  namedAccounts:{
    deployer: {
      default: 0
    }, 
    surveyTaker: {
      default: 1
    }
  }, 
  mocha: {
    timeout: 300000 // 300,000 milliseconds = 300 seconds max
  }
};
