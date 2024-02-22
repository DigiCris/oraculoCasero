// SPDX-License-Identifier: MIT
pragma solidity >0.7.0 <0.9.9;

contract oraculo {

    uint256 public _requestId;
/*
url
caller = SC que solicita el request
parser "RAW,ETH,USD,MEDIAN"
selector = indica la funcion a llamar
jobID= "uint256"
requestId
*/
    event get(address caller, bytes4 selector, string parser, string jobID, string url, uint256 requestId);

    function oracle(bytes4 selector, string memory parser, string memory jobID, string memory  url) external returns(uint256) {
        address caller = msg.sender;
        _requestId++;

// Hrdcodeado
/*
url = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD";
parser = "RAW,ETH,USD,MEDIAN";
selector = this.fullfill.selector;
jobID= "uint256";
*/

        emit get(caller, selector, parser, jobID, url, _requestId);
        return(_requestId);
    }

    function fullfill(uint256 value, uint256 requestId) public view {}

}