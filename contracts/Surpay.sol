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
    Survey[] private s_surveys;
    Survey[] private s_completeSurveys;
    uint256 private immutable surveyCreationFee;

    /* constructor */
    constructor(uint256 _surveyCreationFee){
        surveyCreationFee = _surveyCreationFee;
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
        Survey[] memory allSurveys = s_surveys;
        for (uint256 i=0;i<allSurveys.length;i++){
            if (allSurveys[i].surveyState == SurveyState.COMPLETED){
                s_completeSurveys.push(allSurveys[i]);
                allSurveys[i].surveyState = SurveyState.CONCLUDED;
            }
        }
        if (s_completeSurveys.length > 0){
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

            Survey memory newSurvey;
            newSurvey.surveyId = _surveyId;
            newSurvey.companyId = _companyId;
            newSurvey.companyAddress = msg.sender;
            newSurvey.totalPayoutAmount = _totalPaymentAmount;
            newSurvey.numOfParticapantsDesired = _numOfParticipantsDesired;
            newSurvey.surveyState = SurveyState.OPEN;
            s_surveys.push(newSurvey);
    }

    function distributeFundsFromCompletedSurveys() internal {
        
    }

    // function clearConcludedSurveys(){}
    
    // function submitUserSurveyData(){}
   


}