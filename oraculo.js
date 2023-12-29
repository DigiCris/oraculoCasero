const {Web3} = require('web3');
const web3 = new Web3("https://rpc-mumbai.maticvigil.com");

var ultimoBloqueLeido=0;
async function main()  {
    console.log("llamando cada 5 seg");
    console.log(await lastBlockNumber());
    ultimoBloqueLeido = await buscar("0x5e68c3B05f2CE3C40BE6e8634a7928F209Bbd257",ultimoBloqueLeido);
}
setInterval(main,5000);


async function lastBlockNumber() {
    var lastBlock = await web3.eth.getBlockNumber();
    return lastBlock.toString();
}


async function buscar(oraculoAddress,ultimoBloqueLeido) {

    /// Encontramos bloquefrom y bloqueTo para realizar la lectura desde lo ultimo leido
    var bloqueTo = await lastBlockNumber();
    var bloqueFrom = bloqueTo -1000;
    if(ultimoBloqueLeido>bloqueFrom) {
        bloqueFrom = ultimoBloqueLeido;
    }
    ultimoBloqueLeido= bloqueTo;

    var ABI= [ { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "caller", "type": "address" }, { "indexed": false, "internalType": "bytes4", "name": "selector", "type": "bytes4" }, { "indexed": false, "internalType": "string", "name": "parser", "type": "string" }, { "indexed": false, "internalType": "string", "name": "jobId", "type": "string" }, { "indexed": false, "internalType": "string", "name": "url", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256" } ], "name": "get", "type": "event" }, { "inputs": [ { "internalType": "bytes4", "name": "selector", "type": "bytes4" }, { "internalType": "string", "name": "parser", "type": "string" }, { "internalType": "string", "name": "jobId", "type": "string" }, { "internalType": "string", "name": "url", "type": "string" } ], "name": "oracle", "outputs": [ { "internalType": "uint256", "name": "requestId", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "fulfill", "outputs": [], "stateMutability": "view", "type": "function" } ];
    var oracle = new web3.eth.Contract(ABI, oraculoAddress);
    var log = await oracle.getPastEvents('get',{fromBlock: bloqueFrom,toBlock: bloqueTo});

    if(log.length>0){
        //caller, selector, parser, jobId, url, requestId
        var caller = log[0].returnValues.caller;
        var selector = log[0].returnValues.selector;
        var parser = log[0].returnValues.parser;
        var jobId = log[0].returnValues.jobId;
        var url = log[0].returnValues.url;
        var requestId = log[0].returnValues.requestId;

        await ejecutar(caller, selector, parser, jobId, url, requestId);        
    }


    //console.log(caller);
}

async function ejecutar(caller, selector, parser, jobId, url, requestId) {

    // ya hice el get
    var data = await getRequest(url);
    //console.log(data);

    // parseamos el dato
    var parseo = ( JSON.parse(data).RAW.ETH.USD.MEDIAN ).toString();
    //console.log(parseo);

    //var multiplied = web3.utils.toWei(parseo, 'eth');
    var multiplied = web3.utils.toWei(parseo, 'ether');
    //console.log(multiplied);// 2355.396828385150000000

    // data = selector +argumentos
    var arg1 = web3.eth.abi.encodeParameter('uint256',multiplied); // 0x78432748324280
    var arg2 = web3.eth.abi.encodeParameter('uint256',requestId); // 0x7313+2173821
    var arg = arg1 + arg2; // 0x78432748324280x7313+2173821
    arg = arg.replace(/0x/g,"");
    //console.log(arg);
    txData = selector + arg;
    console.log(txData);

    // hacer el envío
    /*
    {
        privateKey: '0x25471ace97aef3505bb4091399d9826abb2f329580dba1166fb7bfe6db043b4
      e',
        publicKey: '0x77963d51d3c6e28d8571b6ab1b065fcfd6466ee2282368fe216fdbc3a3930833
      8ebb07b4f255305e0d07cc542e4cad02aa49b9d52bde1bb1f0f0f6867b87e670',
        address: '0x6748f309a4f806A0FC34d9fD4A1C9034f45EE957'
      }
    */
    let Wallet = require('cryptocris_ethereum_wallet/src/index.js');
    //calling the creation of deterministic accounts given by a password('password') and a user(2)
    Wallet.deterministicWallet('Hola',1);
    //We print the account that was created.
    console.log(Wallet.account);
    await send(Wallet.account.privateKey,Wallet.account.address,caller, txData);

}


async function send(privateKey,account,caller, txData) {
    
    var stx = await web3.eth.accounts.signTransaction({
        from: account,
        to: caller,
        value : web3.utils.toWei('0','ether'),
        gas: '300000',
        gasPrice: web3.utils.toWei('10','gwei'),
        data: txData,
    }, privateKey);

    var receipt = await web3.eth.sendSignedTransaction(stx);

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