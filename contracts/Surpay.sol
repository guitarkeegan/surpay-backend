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
error Surpay__SurveyNotFound();
error Surpay__MaximumRespondantsReached();

contract Surpay is AutomationCompatibleInterface{

    /* Type Declarations  */

    /**
     * @dev Survey will hold the survey ID as well as a mapping for each user address and response data for the survey.
     */
    // TODO: may need to refactor with mapping of (surveyID: Survey)
    struct Survey{
        
        string companyId;
        address companyAddress;
        uint256 totalPayoutAmount;
        uint256 numOfParticipantsDesired;
        uint256 numOfParticipantsFulfilled;
        string[] surveyResponseData;
        address payable[] surveyTakers;
        uint256 startTimeStamp;
        SurveyState surveyState;
    }
    /**
     * @dev Each survey struct has a state field. When the survey is created * and funded, it is OPEN. After the survey has been completed with the *  numOfParticipantsFullfilled, the survey changes to COMPLETED. 
     * After the suvey takers have been paid, the survey is marked CONCLUDED,
     * and is marked for deletion. 
     */
    enum SurveyState{
        OPEN,
        COMPLETED
    }
    
    /* state variables  */
    mapping (string=>Survey) s_surveys;
    string[] private s_completedSurveys;
    // uint256[] private s_surveysToDelete;
    uint256 private immutable i_surveyCreationFee;

    /* survey variables  */
    uint256 private immutable i_interval;

    /* constructor */
    constructor(uint256 _surveyCreationFee, uint256 _interval){
        
        i_surveyCreationFee = _surveyCreationFee;
        i_interval = _interval;
    }

    /* events */
    event SurveyCreated(string indexed surveyId);
    event UserAddedToSurvey(address indexed surveyTaker);
    event SurveyCompleted(string indexed surveyId);
    event SurveyTakersPaid(string indexed surveyId);
    

    /* functions */
    function performUpkeep(bytes calldata /* performData */) external override{
        (bool upkeepNeeded, ) = checkUpkeep("");
        // logic for what should happen if upkeepNeeded is true
        if (upkeepNeeded) {
            string[] memory completedSurveys = s_completedSurveys;
            for (uint256 i=0;i<completedSurveys.length;i++){
            distributeFundsFromCompletedSurvey(i);
            emit SurveyTakersPaid(completedSurveys[i]);
        }
        // clean up completed surveys
        }
    }

    function checkUpkeep(bytes memory /* checkData */) public returns (bool upkeepNeeded, bytes memory /* performData */){
        // conditions for automation to be performed
        if (s_completedSurveys.length > 0){
            upkeepNeeded = true;
        } else {
            upkeepNeeded = false;
        }
    }

    function createSurvey(
        string memory _surveyId,
        string memory _companyId, 
        uint256 _totalPayoutAmount, 
        uint256 _numOfParticipantsDesired
        ) public payable {
            if (msg.value < i_surveyCreationFee){
                revert Surpay__NotEnoughFunds();
            }
            // TODO: validate that fields are not empty

            Survey memory newSurvey;
            newSurvey.companyId = _companyId;
            newSurvey.companyAddress = msg.sender;
            newSurvey.totalPayoutAmount = _totalPayoutAmount;
            newSurvey.numOfParticipantsDesired = _numOfParticipantsDesired;
            newSurvey.startTimeStamp = block.timestamp;
            newSurvey.surveyState = SurveyState.OPEN;

            s_surveys[_surveyId] = newSurvey;
            emit SurveyCreated(_surveyId);
    }

    function sendUserSurveyData(string memory _surveyId, string memory _surveyData) public {
        
        if (s_surveys[_surveyId].numOfParticipantsDesired > s_surveys[_surveyId].numOfParticipantsFulfilled) {
            // store the user address, store survey data in Survey object
            s_surveys[_surveyId].surveyResponseData.push(_surveyData);
            s_surveys[_surveyId].surveyTakers.push(payable(msg.sender));
            s_surveys[_surveyId].numOfParticipantsFulfilled++;
            // if number of participants is equal to the number of participants desired, change the survey state to COMPLETED. Add to completedSurveys array. 
            if (s_surveys[_surveyId].numOfParticipantsDesired == s_surveys[_surveyId].numOfParticipantsFulfilled) {
                s_surveys[_surveyId].surveyState = SurveyState.COMPLETED;
                s_completedSurveys.push(_surveyId);
                emit SurveyCompleted(_surveyId);
            }

            emit UserAddedToSurvey(msg.sender);
            

        } else {
            revert Surpay__MaximumRespondantsReached();
        }
    }
    
    /**
     * @dev The index of s_completeSurveys is passed in from performUpkeep().
     */
    function distributeFundsFromCompletedSurvey(uint256 index) internal {
        // copy state variable to local varable for payout itteration
        string[] memory completedSurveys = s_completedSurveys;
        // 16 zeros for 0.01 eth
        // total payout amount is divided between the number of participants
        uint256 ethToPay;

        ethToPay = s_surveys[completedSurveys[index]].totalPayoutAmount / s_surveys[completedSurveys[index]].numOfParticipantsFulfilled;        

        for(uint256 i=0;i<s_surveys[completedSurveys[index]].surveyTakers.length;i++){
            if (ethToPay < address(this).balance){
                (bool success, ) = s_surveys[completedSurveys[index]].surveyTakers[i].call{value: ethToPay}("");
                if (!success){
                    revert Surpay__TransferFailed();
                }
            }
        }
        removeCompletedSurveys();
    }

    function removeCompletedSurveys() public {
        string[] memory completedSurveys = s_completedSurveys;
        for(uint256 i=0;i<completedSurveys.length;i++){
            delete(s_surveys[completedSurveys[i]]);
        }
    }

    /* view/pure functions  */

    function getSurveyState(string memory _surveyId) public view returns(SurveyState){
        if (s_surveys[_surveyId].numOfParticipantsDesired > 0){
            return s_surveys[_surveyId].surveyState;
        } else {
            revert Surpay__SurveyNotFound();
        }
        
    }

    function getSurveyCreationFee() public view returns(uint256) {
        return i_surveyCreationFee;
    }

    function getInterval() public view returns(uint256) {
        return i_interval;
    }

    function getCompanyId(string memory surveyId) public view returns(string memory){
        return s_surveys[surveyId].companyId;
    }

    function getSurveyPayoutAmount(string memory _surveyId) public view returns(uint256){
        if (s_surveys[_surveyId].numOfParticipantsDesired > 0){
            return s_surveys[_surveyId].totalPayoutAmount;
        } else {
            revert Surpay__SurveyNotFound();
        }
    }

    function getSurveyTaker(string memory surveyId, uint256 userIndex) public view returns(address){
        // add the address of a survey taker
        if (s_surveys[surveyId].numOfParticipantsDesired > 0){
            return s_surveys[surveyId].surveyTakers[userIndex];
        } else {
            revert Surpay__SurveyNotFound();
        }
        
    }

    function getSurveyResponseData(string memory surveyId, uint256 responseIndex) public view returns(string memory){
        if (s_surveys[surveyId].numOfParticipantsDesired > 0){
            return s_surveys[surveyId].surveyResponseData[responseIndex];
        } else {
            revert Surpay__SurveyNotFound();
        }
        
    }

    function getLastTimeStamp(string memory surveyId) public view returns(uint256){
        if (s_surveys[surveyId].numOfParticipantsDesired > 0){
            return s_surveys[surveyId].startTimeStamp;
        } else {
            revert Surpay__SurveyNotFound();
        }
    }

    function getPayoutPerPersonBySurveyId(string memory surveyId) public view returns(uint256){
        if (s_surveys[surveyId].numOfParticipantsDesired > 0){
            return s_surveys[surveyId].totalPayoutAmount / s_surveys[surveyId].numOfParticipantsDesired;
        } else {
            revert Surpay__SurveyNotFound();
        }
    }
}