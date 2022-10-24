// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

// import AutomationCompatibleInterface
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

contract Surpay is AutomationCompatibleInterface{
    // create storage for surveys and user data
    struct Company{
        string id;
        address companyAddress;
        Survey[] surveys;
    }
    /**
     * @dev Survey will hold the survey ID as well as a mapping for each user address and response data for the survey.
     */
    struct Survey{
        string id;
        uint256 totalPayoutAmount;
        uint256 numOfParticapants;
        string surveyResponseData;
        address payable[] surveyTakers;
    }
    
    /* state variables  */
    Company[] public companies;
    uint256 private immutable surveyCreationFee;
    uint256 private immutable companyCreationFee;

    /* constructor */
    constructor(uint256 _surveyCreationFee, uint256 _companyCreationFee){
        surveyCreationFee = _surveyCreationFee;
        companyCreationFee = _companyCreationFee;
    }

    /* events */

    /* functions */

    function performUpkeep(bytes calldata /* performData */) external override{
        (bool upkeepNeeded, ) = checkUpkeep("");
        // logic for what should happen if upkeepNeeded is true
    }

    function checkUpkeep(bytes memory /* checkData */) public returns (bool upkeepNeeded, bytes memory /* performData */){
        // conditions for automation to be performed
    }

    // function createCompany(){}
    // function createSurvey(){}
    // function submitUserSurveyData(){}
   


}