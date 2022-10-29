const {assert, expect} = require("chai");
const {getNamedAccounts, deployments, ethers, network} = require("hardhat");
const {developmentChains, networkConfig} = require("../../helpers.hardhat-config");
// check if current chain is hardhat or localhost
!developmentChains.includes(network.name)
    ?
    describe.skip
    : describe("Surpay", function(){
        let interval, surveyCreationFee;
        const chainId = network.config.chainId;

        beforeEach(async function(){
            deployer = (await getNamedAccounts()).deployer;
            console.log("Deploying contract...")
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
            console.log("creating survey...")
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
        describe("checkUpkeep", function(){
            // create a new survey and fund
            beforeEach(async function(){
                console.log("creating survey...")
                await surpay.createSurvey(
                    networkConfig[chainId]["surveyId"][0],
                    networkConfig[chainId]["companyId"][0],
                    networkConfig[chainId]["totalPayoutAmount"],
                    networkConfig[chainId]["numOfParticipantsDesired"],
                    {value: networkConfig[chainId]["totalPayoutAmount"]}
                    );
            });

            it("returns false if there are no completed surveys", async function(){
                const {upkeepNeeded} = await surpay.callStatic.checkUpkeep("0x");
                assert(!upkeepNeeded);
            });
            it("returns true if the desired number of survey takers has been fulfilled", async function(){

                const accounts = await ethers.getSigners();
                const account1ConnectedSurpay = surpay.connect(accounts[1]);
                const account2ConnectedSurpay = surpay.connect(accounts[2]);
                
                await account1ConnectedSurpay.sendUserSurveyData(
                    networkConfig[chainId]["surveyId"][0],
                    networkConfig[chainId]["surveyResponseData"][0]);
                await account2ConnectedSurpay.sendUserSurveyData(
                    networkConfig[chainId]["surveyId"][0],
                    // mary jane data
                    networkConfig[chainId]["surveyResponseData"][1]);

                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                await network.provider.send("evm_mine", []);

                const {upkeepNeeded} = await surpay.callStatic.checkUpkeep([]);
                console.log(upkeepNeeded);
                assert(upkeepNeeded);
            })
        })
        describe("distributeFundsFromCompletedSurvey", function(){
            let startTimeStamp;
            beforeEach(async function(){
                await surpay.createSurvey(
                    networkConfig[chainId]["surveyId"][0],
                    networkConfig[chainId]["companyId"][0],
                    networkConfig[chainId]["totalPayoutAmount"],
                    networkConfig[chainId]["numOfParticipantsDesired"],
                    {value: networkConfig[chainId]["totalPayoutAmount"]}
                    );
                startTimeStamp = await surpay.getLastTimeStampBySurveyIndex(0);
                const accounts = await ethers.getSigners();
                const account1ConnectedSurpay = surpay.connect(accounts[1]);
                const account2ConnectedSurpay = surpay.connect(accounts[2]);
                
                await account1ConnectedSurpay.sendUserSurveyData(
                    networkConfig[chainId]["surveyId"][0],
                    networkConfig[chainId]["surveyResponseData"][0])
                await account2ConnectedSurpay.sendUserSurveyData(
                    networkConfig[chainId]["surveyId"][0],
                    // mary jane data
                    networkConfig[chainId]["surveyResponseData"][1])

                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                await network.provider.send("evm_mine", []);
            });

            it("should send funds to all survey takers, survey taker's wallet balance should be equal to the projected payout amout", async function(){
                // will need to mimic chainlink automation for this part
                //get start time stamp from survey struct
                
                await new Promise( async (reject, resolve) => {
                    surpay.once("SurveyCompleted", async ()=>{
                        console.log("Survey completed event has fired!");
                        try {
                            const joeEndingBalance = await accounts[1].getBalance();
                            const maryEndingBalance = await accounts[2].getBalance();
                            assert(joeEndingBalance > joeStartingBalance);
                            assert(maryEndingBalance > maryStartingBalance);
                            assert.equal(joeEndingBalance, joeStartingBalance.add(await surpay.getPayoutPerPersonBySurveyIndex(0)));
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    });
                    // kicking off the event by mocking the chainlink automation
                    const tx = await surpay.performUpkeep("0x");
                    const txReceipt = await tx.wait(1);
                    // console.log(txReceipt)
                    const joeStartingBalance = await accounts[1].getBalance();
                    const maryStartingBalance = await accounts[2].getBalance();

                });
            });
        })
    })
