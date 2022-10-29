# Surpay  ![MIT](https://img.shields.io/badge/license-MIT-green)

  - [Description](#description)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Contributions](#contributions)
  - [Tests](#tests)
  - [Questions](#questions)
  - [License?](#license)

  ## Description
 
  A Chainlink Hackathon 2022 project. We decided to explore the idea of using a smart contract to facilitate an exchange of funds for data. The project combines both web3 and web2 technologies in order to accomplish this goal. The project can be explained as follows:
   ```
   1. A company creates a survey. 
   2. A company adds funds to the smart contract. 
   3. A user takes the survey. 
   4. The user signs the transaction to submit their survey response to the contract. 
   5. Chainlink Automation is brought in to check the state of the survey. 
   6. When the survey is deemed completed, the contract distributes the funds to the users.
   ```

  ## Installation

  Clone the repo, then install hardhat along with all dependancies. You will need to setup a .env file in order to deploy to the Goerli test net. The .env file should include: GOERLI_RPC_URL which can be found in the developer section of https://chain.link/, PRIVATE_KEY from you metamask wallet, ETHERSCAN_API_KEY which you can get for from from Etherscan, and the COINMARKETCAP_API_KEY which you can also get for free from coinmarketcap. Once you have installed all dependancies ```yarn install``` or ```npm i```, you can run the script locally with ```yarn hardhat deploy```.

  ## Usage

  > The contract would allow companies to offer a paid insentive for users to take a survey. 

  ## Contributions
  
  The project was authored by Keegan Anglim and Alan Abed. If you'd like to ask any questions, please contact either one of us at the email below.

  ## Tests

  Unit tests can be run locally with ```yarn hardhat test```.

  ## Questions

  [My Github profile](https://github.com/guitarkeegan)

  Send me (Keegan) an email at keegananglim@gmail.com or email Alan at alanabed@gmail.com.

  ## License
  This project is licensed under the [MIT License](https://choosealicense.com/licenses/mit/) - click the link to read the license.
  
 