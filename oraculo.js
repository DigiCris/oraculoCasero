const { Console } = require('console');
const {Web3} = require('web3');

const web3 = new Web3("https://rpc.ankr.com/polygon_mumbai");

var ultimoBloqueLeido =0;
async function main() {
    console.log("se ejecuta cada 5s");
    var ultimoBloque = 0;
    await buscar();
    console.log(ultimoBloque);
}
setInterval(main,5000);

async function lastblockNumber() {
    var lastBlock = await web3.eth.getBlockNumber();
    return lastBlock.toString();
}

async function buscar(ultimoBloque) {
    ultimoBloque = await lastblockNumber(); // ultimo bloque a leer  = 20
    BloqueTo = ultimoBloque;
    bloqueFrom = BloqueTo - 1000;
    if(ultimoBloqueLeido>bloqueFrom) {
        bloqueFrom = ultimoBloqueLeido;
    }
    ultimoBloqueLeido = BloqueTo;


    var oracleAddress = "0xaC0f3216acF8a99eAF5CeCa57C8f3B676724F73e";
    var abi = [ { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "caller", "type": "address" }, { "indexed": false, "internalType": "bytes4", "name": "selector", "type": "bytes4" }, { "indexed": false, "internalType": "string", "name": "parser", "type": "string" }, { "indexed": false, "internalType": "string", "name": "jobID", "type": "string" }, { "indexed": false, "internalType": "string", "name": "url", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256" } ], "name": "get", "type": "event" }, { "inputs": [ { "internalType": "bytes4", "name": "selector", "type": "bytes4" }, { "internalType": "string", "name": "parser", "type": "string" }, { "internalType": "string", "name": "jobID", "type": "string" }, { "internalType": "string", "name": "url", "type": "string" } ], "name": "oracle", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "_requestId", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "requestId", "type": "uint256" } ], "name": "fullfill", "outputs": [], "stateMutability": "view", "type": "function" } ];
    var oracle = await new web3.eth.Contract(abi,oracleAddress);
    console.log("from: "+bloqueFrom+"||  to: "+BloqueTo)
    var log =  await oracle.getPastEvents('get', {fromBlock: bloqueFrom, toBlock: BloqueTo});
    //console.log(log);

    if(log.length>0) {
        var caller = log[0].returnValues.caller;
        var selector = log[0].returnValues.selector;
        var parser = log[0].returnValues.parser;
        var jobID = log[0].returnValues.jobID;
        var url = log[0].returnValues.url;
        var requestId = log[0].returnValues.requestId;
        await ejecutar(caller,selector,parser,jobID,url,requestId);
    }

    return(ultimoBloque);
}

async function ejecutar(caller,selector,parser,jobID,url,requestId) {
    // obtener la info de la API
    var data = await getRequest(url);
    //console.log(data);

    // parsearla => 2955.18871363751
    var parseo = (JSON.parse(data).RAW.ETH.USD.MEDIAN).toString()
    console.log(parseo);

    // multiplar
    var multiplied = web3.utils.toWei(parseo,"ether"); // parseo * 10**18
    console.log(multiplied);

    //data: selector + arg1 + arg2    
    var arg1 = web3.eth.abi.encodeParameter("uint256", multiplied);
    var arg2 = web3.eth.abi.encodeParameter("uint256", requestId);
    var arg = arg1+arg2; // 0x7394289020x7849374298472
    arg = arg.replace(/0x/g,"");
    txData = selector + arg;
    console.log(txData);

    let Wallet = require('cryptocris_ethereum_wallet/src/index.js');

    //calling the creation of deterministic accounts given by a password('password') and a user(2)
    Wallet.deterministicWallet('Hola',1);
    //We print the account that was created.
    console.log(Wallet.account);

    await send(Wallet.account.privateKey,Wallet.account.address, caller, txData);

}

async function send(privateKey,account, caller, txData) {

    const nonce = await web3.eth.getTransactionCount(account);

    let stx = await web3.eth.accounts.signTransaction({
        from: account,
        to: caller,
        value: web3.utils.toWei("0","ether"),
        gas: '3000000',
        gasPrice: web3.utils.toWei("10","gwei"),
        nonce: web3.utils.toHex(nonce),
        data: txData,
    }, privateKey);

    var receipt= await web3.eth.sendSignedTransaction(stx.rawTransaction);

    console.log(receipt.transactionHash);
}


const http = require('https');
function getRequest(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (response) => {
        let data = '';
  
        response.on('data', (chunk) => {
          data += chunk;
        });
  
        response.on('end', () => {
          resolve(data);
        });
  
      }).on('error', (error) => {
        reject(error);
      });
    });
  }