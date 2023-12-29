// SPDX-License-Identifier: MIT
pragma solidity >0.7.0 <0.9.0;

import "./oraculo.sol";

contract api {

    uint public _requestID;
    uint256 public value;
    oraculo public oracle;

    function setOracle(address _addr) public {
        oracle = oraculo(_addr);
    }


    function askApi() external {
        //address caller=address(this);
    string memory url= "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD";
    string memory jobId = "uint256";
    string memory parser = "RAW,ETH,USD,MEDIAN";
     bytes4 selector = this.fulfill.selector;

        _requestID= oracle.oracle(selector, parser, jobId, url);

    }


    function fulfill(uint256 _value, uint256 reqid) public {
        if(reqid==_requestID) {
            value = _value;
        }
        value = _value;
    }

}