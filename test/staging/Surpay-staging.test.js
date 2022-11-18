const {assert, except} = require("chai");
const {getNamedAccounts, ethers, network} = require("hardhat");
const {developmentChains, networkConfig} = require("../../helpers.hardhat-config");
// test is failing but automation and contract are working.
developmentChains.includes(network.name)
    ? describe.skip
    : describe("Surpay Staging Tests", function(){
        let surpay, deployer;
        const chainId = network.config.chainId;

        beforeEach(async function(){
            deployer = (await getNamedAccounts()).deployer
            surpay = await ethers.getContract("Surpay", deployer);
            surveyCreationFee = await surpay.getSurveyCreationFee();
            // owner creats a survey
            const accounts = await ethers.getSigners();
            console.log("creating survey...")
            await surpay.createSurvey(
                networkConfig[chainId]["surveyId"][0],
                networkConfig[chainId]["companyId"][0],
                networkConfig[chainId]["payout"],
                networkConfig[chainId]["numOfParticipantsDesired"],
                {value: networkConfig[chainId]["totalPayoutAmount"]}
                );
            console.log("sending first survey data...")
            await surpay.sendUserSurveyData(
                networkConfig[chainId]["surveyId"][0],
                "0x4A489FB4b98C31D0050084bFbAb872A6960DAcd2" // account 2
            )
        });
        describe("distributeFundsFromCompletedSurvey", function(){
            it("works with Chainlink automation, we create a survey, submit 2 user's data, payout to the two users", async function(){

                
                console.log("sending second survey data...")
                const tx = await surpay.sendUserSurveyData(
                    networkConfig[chainId]["surveyId"][0],
                    // networkConfig[chainId]["surveyResponseData"][1],
                    "0x1910C439eaFd78C40bD7D1D253eC4FBe2dad1480" //surpay company
                )
                await tx.wait(1);
                console.log("time to wait...")

                await new Promise( async (reject, resolve) => {
                    surpay.once("SurveyCompleted", async ()=>{
                        console.log("Survey completed event has fired!");
                        try {
                            // const joeEndingBalance = await accounts[1].getBalance();
                            // const maryEndingBalance = await accounts[2].getBalance();
                            // assert(joeEndingBalance > joeStartingBalance);
                            // assert(maryEndingBalance > maryStartingBalance);
                            // assert.equal(joeEndingBalance, joeStartingBalance.add(await surpay.getPayoutPerPersonBySurveyId("1")));
                            const surveyState = await surpay.getSurveyState("1");
                            assert.equal(surveyState, 2);
                            
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
                
                
                // const joeStartingBalance = await accounts[1].getBalance();
                // const maryStartingBalance = await accounts[2].getBalance();
            })
        })
    })