// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

contract Surpay{
    // create storage for surveys and user data
    struct Company{
        string id;
        Survey[] survey;
    }
    struct Survey{
        string id;
        mapping (address => string) surveyResponces;
    }
    
    /* global vars  */
    Company[] public companies;

}