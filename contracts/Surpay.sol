// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

/**
 * @title Surpay
 * @author Keegan Anglim and Alan Abed
 * @notice This contract is meant to be a demo and should not be used
 * in production
 * 
 */

// import AutomationCompatibleInterface
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

error Surpay__NotEnoughFunds();
error Surpay__MissingRequiredFields();
error Surpay__TransferFailed();

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
        uint256 numOfParticipantsDesired;
        uint256 numOfParticipantsFulfilled;
        string[] surveyResponseData;
        address payable[] surveyTakers;
        SurveyState surveyState;
    }
    /**
     * @dev Each survey struct has a state field. When the survey is created * and funded, it is OPEN. After the survey has been completed with the *  numOfParticipantsFullfilled, the survey changes to COMPLETED. 
     * After the suvey takers have been paid, the survey is marked CONCLUDED,
     * and is marked for deletion. 
     */
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
            // TODO: validate that fields are not empty

            Survey memory newSurvey;
            newSurvey.surveyId = _surveyId;
            newSurvey.companyId = _companyId;
            newSurvey.companyAddress = msg.sender;
            newSurvey.totalPayoutAmount = _totalPaymentAmount;
            newSurvey.numOfParticipantsDesired = _numOfParticipantsDesired;
            newSurvey.surveyState = SurveyState.OPEN;
            s_surveys.push(newSurvey);
            emit SurveyCreated(_surveyId);
    }

    function distributeFundsFromCompletedSurvey(string memory _surveyId) internal {
        Survey[] memory allSurveys = s_completeSurveys;

        address payable[] memory surveyTakersToPayout;
        // 16 zeros for 0.01 eth
        uint256 ethToPay;

        for(uint256 i=0;i<allSurveys.length;i++){
            if (keccak256(abi.encodePacked(allSurveys[i].surveyId)) == keccak256(abi.encodePacked(_surveyId))){
                surveyTakersToPayout = allSurveys[i].surveyTakers;
                ethToPay = allSurveys[i].totalPayoutAmount / allSurveys[i].numOfParticipantsFulfilled;
                break;
            }
        }

        for(uint256 i=0;i<surveyTakersToPayout.length;i++){
            if (ethToPay < address(this).balance){
                (bool success, ) = surveyTakersToPayout[i].call{value: ethToPay}("");
                if (!success){
                    revert Surpay__TransferFailed();
                }
            }
        }
    }

    // function clearConcludedSurveys(){}
    
    // function submitUserSurveyData(){}
   


}