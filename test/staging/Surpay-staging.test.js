const {assert, except} = require("chai");
const {getNamedAccounts, ethers, network} = require("hardhat");
const {developmentChains} = require("../../helpers.hardhat-config");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Surpay Staging Tests", function(){
        let surpay, surveyCreationFee, deployer;

        beforeEach(async function(){
            deployer = (await getNamedAccounts()).deployer
            surpay = await ethers.getContract("Surpay", deployer);
            surveyCreationFee = await surpay.getSurveyCreationFee();
        });
        describe("distributeFundsFromCompletedSurvey", function(){
            it("works with Chainlink automation")
        })
    })