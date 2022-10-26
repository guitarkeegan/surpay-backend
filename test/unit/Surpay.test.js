const {assert, expect} = require("chai");
const {getNamedAccounts, deployments, ethers, network} = require("hardhat");
const {developmentChains, networkConfig} = require("../../helpers.hardhat-config");

!developmentChains.includes(network.name)
    ?
    describe.skip
    : describe("Surpay", function(){
        let interval, surveyCreationFee;
        const chainId = network.config.chainId;

        beforeEach(async function(){
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            surpay = await ethers.getContract("Surpay", deployer);
            surveyCreationFee = await surpay.getSurveyCreationFee();
            interval = await surpay.getInterval();
        });

        describe("constructor", function(){

            it("should be setup with the correct interval", async function(){
                assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
            });
        })
    })
