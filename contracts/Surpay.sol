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
    struct Survey{
        string surveyId;
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
    Survey[] private s_surveys;
    Survey[] private s_completeSurveys;
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
            Survey[] memory completedSurveys = s_completeSurveys;
            for (uint256 i=0;i<completedSurveys.length;i++){
            distributeFundsFromCompletedSurvey(i);
            emit SurveyTakersPaid(completedSurveys[i].surveyId);
        }
        
        }
    }

    function checkUpkeep(bytes memory /* checkData */) public returns (bool upkeepNeeded, bytes memory /* performData */){
        // conditions for automation to be performed
        Survey[] memory allSurveys = s_surveys;
        for (uint256 i=0;i<allSurveys.length;i++){
            if (allSurveys[i].surveyState == SurveyState.COMPLETED){
                s_completeSurveys.push(allSurveys[i]);
            }
        }
        if (s_completeSurveys.length > 0){
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
            newSurvey.surveyId = _surveyId;
            newSurvey.companyId = _companyId;
            newSurvey.companyAddress = msg.sender;
            newSurvey.totalPayoutAmount = _totalPayoutAmount;
            newSurvey.numOfParticipantsDesired = _numOfParticipantsDesired;
            newSurvey.startTimeStamp = block.timestamp;
            newSurvey.surveyState = SurveyState.OPEN;
            s_surveys.push(newSurvey);
            emit SurveyCreated(_surveyId);
    }

    function sendUserSurveyData(string memory _surveyId, string memory _surveyData) public {
        // get the survey by id
        for (uint256 i=0;i<s_surveys.length;i++){
            if (keccak256(abi.encodePacked(s_surveys[i].surveyId)) == keccak256(abi.encodePacked(_surveyId))){

                if (s_surveys[i].numOfParticipantsDesired > s_surveys[i].numOfParticipantsFulfilled) {
                    // store the user address, store survey data in Survey object
                    s_surveys[i].surveyResponseData.push(_surveyData);
                    s_surveys[i].surveyTakers.push(payable(msg.sender));
                    s_surveys[i].numOfParticipantsFulfilled++;
                    // if number of participants is equal to the number of participants desired, change the survey state to COMPLETED
                    if (s_surveys[i].numOfParticipantsDesired == s_surveys[i].numOfParticipantsFulfilled) {
                        s_surveys[i].surveyState = SurveyState.COMPLETED;
                        emit SurveyCompleted(s_surveys[i].surveyId);
                    }

                    emit UserAddedToSurvey(msg.sender);
                    break;

                } else {
                    revert Surpay__MaximumRespondantsReached();
                }
            }
        }

    }
    /**
     * @dev The index of s_completeSurveys is passed in from performUpkeep().
     */
    function distributeFundsFromCompletedSurvey(uint256 index) internal {
        // copy state variable to local varable for payout itteration
        Survey[] memory completedSurveys = s_completeSurveys;
        // 16 zeros for 0.01 eth
        // total payout amount is divided between the number of participants
        uint256 ethToPay;

        ethToPay = completedSurveys[index].totalPayoutAmount / completedSurveys[index].numOfParticipantsFulfilled;        
        
        for(uint256 i=0;i<completedSurveys[index].surveyTakers.length;i++){
            if (ethToPay < address(this).balance){
                (bool success, ) = completedSurveys[index].surveyTakers[i].call{value: ethToPay}("");
                if (!success){
                    revert Surpay__TransferFailed();
                }
            }
        }

    }

    /* view/pure functions  */

    function getSurveyState(string memory _surveyId) public view returns(SurveyState){
        SurveyState currentState;
        for(uint256 i=0;i<s_surveys.length;i++){
            if (keccak256(abi.encodePacked(s_surveys[i].surveyId)) == keccak256(abi.encodePacked(_surveyId))){
                currentState = s_surveys[i].surveyState;
            }
        }
        return currentState;
    }

    function getSurveyCreationFee() public view returns(uint256) {
        return i_surveyCreationFee;
    }

    function getInterval() public view returns(uint256) {
        return i_interval;
    }

    function getSurveyByIndex(uint256 index) public view returns(string memory) {

        if (index < s_surveys.length){
            return s_surveys[index].surveyId;
        } else {
            revert Surpay__SurveyNotFound();
        }
    }

    function getPayoutByIndex(uint256 index) public view returns(uint256){
         if (index < s_surveys.length){
            return s_surveys[index].totalPayoutAmount;
        } else {
            revert Surpay__SurveyNotFound();
        }
    }

    function getSurveyTakerByIndex(uint256 surveyIndex, uint256 userIndex) public view returns(address){
        // add the address of a survey taker
        return s_surveys[surveyIndex].surveyTakers[userIndex];
    }

    function getSurveyResponseDataByIndex(uint256 surveyIndex, uint256 responseIndex) public view returns(string memory){
        return s_surveys[surveyIndex].surveyResponseData[responseIndex];
    }

    function getLastTimeStampBySurveyIndex(uint256 surveyIndex) public view returns(uint256){
        return s_surveys[surveyIndex].startTimeStamp;
    }

    // function clearConcludedSurveys(){}
    
    // function submitUserSurveyData(){}
   


}