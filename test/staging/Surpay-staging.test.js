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
            it("works with Chainlink automation, we create a survey, submit 2 user's data, payout to the two users", async function(){
                
                await new Promise( async (reject, resolve) => {
                    surpay.once("SurveyCompleted", async ()=>{
                        console.log("Survey completed event has fired!");
                        try {
                            const joeEndingBalance = await accounts[1].getBalance();
                            const maryEndingBalance = await accounts[2].getBalance();
                            assert(joeEndingBalance > joeStartingBalance);
                            assert(maryEndingBalance > maryStartingBalance);
                            assert.equal(joeEndingBalance, joeStartingBalance.add(await surpay.getPayoutPerPersonBySurveyId("1")));
                            await expect(getSurveyState("1")).to.be.revertedWith("Surpay__SurveyNotFound");
                            
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
            })
        })
    })