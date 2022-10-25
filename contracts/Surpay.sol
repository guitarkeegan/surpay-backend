// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

// import AutomationCompatibleInterface
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

error Surpay__NotEnoughFunds();
error Surpay__MissingRequiredFields();

contract Surpay is AutomationCompatibleInterface{

    /* Type Declarations  */

    /**
     * @dev Survey will hold the survey ID as well as a mapping for each user address and response data for the survey.
     */
    struct Survey{
        string surveyId;
        string companyId;
        address companyAddress;
        uint256 totalPayoutAmount;
        uint256 numOfParticapantsDesired;
        uint256 numOfParticapantsFullfilled;
        string[] surveyResponseData;
        address payable[] surveyTakers;
        SurveyState surveyState;
    }

    enum SurveyState{
        OPEN,
        COMPLETED,
        CONCLUDED
    }
    
    /* state variables  */
    Survey[] private surveys;
    Survey[] private completeSurveys;
    uint256 private immutable surveyCreationFee;
    uint256 private immutable companyCreationFee;

    /* constructor */
    constructor(uint256 _surveyCreationFee, uint256 _companyCreationFee){
        surveyCreationFee = _surveyCreationFee;
        companyCreationFee = _companyCreationFee;
    }

    /* events */
    event SurveyCreated(string indexed surveyId);
    event SurveyCompleted(string indexed surveyData);
    

    /* functions */

    function performUpkeep(bytes calldata /* performData */) external override{
        (bool upkeepNeeded, ) = checkUpkeep("");
        // logic for what should happen if upkeepNeeded is true
    }

    function checkUpkeep(bytes memory /* checkData */) public returns (bool upkeepNeeded, bytes memory /* performData */){
        // conditions for automation to be performed
        Survey[] memory allSurveys = surveys;
        completeSurveys;
        for (uint256 i=0;i<allSurveys.length;i++){
            if (allSurveys[i].surveyState == SurveyState.COMPLETED){
                completeSurveys.push(allSurveys[i]);
                allSurveys[i].surveyState = SurveyState.CONCLUDED;
            }
        }
        if (completeSurveys.length > 0){
            upkeepNeeded = true;
        }

    }

    function createSurvey(
        string memory _surveyId,
        string memory _companyId, 
        uint256 _totalPaymentAmount, 
        uint256 _numOfParticipantsDesired
        ) public payable {
            if (msg.value < surveyCreationFee){
                revert Surpay__NotEnoughFunds();
            }
            // validate that fields are not empty
            address sender = msg.sender;

            surveys.push(Survey(_surveyId, _companyId, sender, _totalPaymentAmount, _numOfParticipantsDesired, 0, [string], [address], SurveyState.OPEN));
    }

    // function distributeFundsFromCompletedSurveys() internal {
        
    // }

    // function clearConcludedSurveys(){}
    
    // function submitUserSurveyData(){}
   


}