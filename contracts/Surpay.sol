// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

// import AutomationCompatibleInterface
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

contract Surpay{
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
        uint256 payoutAmount;
        mapping (address => string) surveyUsersAndResponseData;
        
    }
    
    /* state variables  */
    Company[] public companies;

    /* constructor */

    /* events */

    /* functions */

    // function createCompany(){}
    // function submitUserSurveyData(){}
    // function createSurvey(){}


}