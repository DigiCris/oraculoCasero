// SPDX-License-Identifier: MIT
pragma solidity >0.7.0 <0.9.9;

import "oraculo.sol";

contract api {

    uint256 public _requestId;
    oraculo public oracle;
    uint256 public _value;

    function setOracle(address _addr) public {
        oracle = oraculo(_addr);
    }

    function askApi() external {
        string memory url = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD";
        string memory parser = "RAW,ETH,USD,MEDIAN";
        bytes4 selector = this.fullfill.selector;
        string memory jobID= "uint256";
        _requestId= oracle.oracle(selector, parser,jobID,url);
    }

    function fullfill(uint256 value, uint256 requestId) public {
        if(requestId == _requestId) {
            _value = value;
        }
        _value = value;
    }

}