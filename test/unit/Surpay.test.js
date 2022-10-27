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
        });
        describe("sendUserSurveyData", function(){

            beforeEach(async function(){
                await surpay.createSurvey(
                    networkConfig[chainId]["surveyId"][0],
                    networkConfig[chainId]["companyId"][0],
                    networkConfig[chainId]["totalPayoutAmount"],
                    networkConfig[chainId]["numOfParticipantsDesired"],
                    {value: networkConfig[chainId]["totalPayoutAmount"]}
                    );
            })

            it("should add a survey response and user address to Survey object", async function(){
                const accounts = await ethers.getSigners();
                const accountConnectedSurpay = surpay.connect(accounts[1]);

                await accountConnectedSurpay.sendUserSurveyData(
                    networkConfig[chainId]["surveyId"][0],
                    networkConfig[chainId]["surveyResponseData"][0]
                );
                // params: s_surveys index, Survey.surveyTakers[0]
                // there should be a Survey object at 0 with 1 user in surveyTakers at index 0
                const surveyTakerAddress = await surpay.getSurveyTakerByIndex(0, 0);
                const surveyResponseData = await surpay.getSurveyResponseDataByIndex(0, 0);
                assert.equal(surveyTakerAddress, accounts[1].address);
                // user data should match the data that was passed in.
                assert.equal(surveyResponseData, networkConfig[chainId]["surveyResponseData"][0])
            });
        })
    })
