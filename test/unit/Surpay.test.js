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
            it("should be setup with correct survey creation fee", async function(){
                assert.equal(surveyCreationFee.toString(), networkConfig[chainId]["surveyCreationFee"]);
            });

        })

        describe("createSurvey", function(){

            it("should create a new survey and store it to surveys", async function(){
                await surpay.createSurvey(
                    networkConfig[chainId]["surveyId"][0],
                    networkConfig[chainId]["companyId"][0],
                    networkConfig[chainId]["totalPayoutAmount"],
                    networkConfig[chainId]["numOfParticipantsDesired"],
                    {value: networkConfig[chainId]["totalPayoutAmount"]}
                    );
                const createdSurveyId = await surpay.getSurveyByIndex(0);
                assert.equal(createdSurveyId.toString(), "1");
            });
            it("should emit a survey created event", async function(){
                await expect(surpay.createSurvey(
                    networkConfig[chainId]["surveyId"][0],
                    networkConfig[chainId]["companyId"][0],
                    networkConfig[chainId]["totalPayoutAmount"],
                    networkConfig[chainId]["numOfParticipantsDesired"],
                    {value: networkConfig[chainId]["totalPayoutAmount"]}
                    )).to.emit(surpay, "SurveyCreated");
            });
        })
    })
