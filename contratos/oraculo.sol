// SPDX-License-Identifier: MIT
pragma solidity >0.7.0 <0.9.0;

contract oraculo {

    uint _requestID;

    //url= https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD
    // jobId = "uint256"
    // parser = "RAW,ETH,USD,MEDIAN"
    // caller = 0x748213129371923
    // selector = funcion a llamar
    //requestID
    event get(address caller, bytes4 selector, string parser, string jobId, string url, uint256 requestId);

    function oracle(bytes4 selector, string memory parser, string memory jobId, string memory url) external returns(uint256 requestId) {
        address caller=msg.sender;
/*
    string memory url= "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD";
    string memory jobId = "uint256";
    string memory parser = "RAW,ETH,USD,MEDIAN";
     bytes4 selector = this.fulfill.selector;
     */
    _requestID++;

        emit get(caller, selector, parser, jobId, url, requestId);
        return(_requestID);
    }


    function fulfill() view public {

    }

}