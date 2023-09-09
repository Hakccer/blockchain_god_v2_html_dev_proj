// importing the ethers file over here
import { ethers } from "./ethers-5.1.esn.min.js";
import { abi, Fundme_address } from "./contract_details.js"; 

var connect_show = document.getElementById("connect_show")
var input_ele = document.getElementsByTagName("input")[0]
var getBalance = document.getElementById("getBalance")
var withdraw_button = document.getElementById("wd_button")

var connected = false
var is_eth_compatible; 

function set_connect_show_text(data){
    connect_show.innerText = `compatible (${data})`
}

is_eth_compatible = async()=>{
    if (await window.ethereum){
        console.log("sd");
        connect_show.innerText = "Compatible (Disconnected)"
        return true;
    }
    else{
        connect_show.innerText = "Incompatible"
        return false
    }
}

is_eth_compatible()

const connect_button = async() => {
    if(!connected){
        if (is_eth_compatible()){
            // making the connection request to meta-mask
            try{
                set_connect_show_text("connecting...")
                await window.ethereum.request({
                    method: 'eth_requestAccounts'
                }) 
                set_connect_show_text("Connected")
                // changing the variable connected to true
                connected = true;
                
            }
            catch{
                set_connect_show_text("disconnected")
            }
        }
    }
    else{
        console.log("already connected...");
    }
}

const listenforTransactionConfirmation = (transaction, provider) => {
    console.log(`Waiting For transaction to be mined\n${transaction.hash}`);
    return new Promise((resolve, reject)=>{
        provider.once(transaction.hash, (transactionReceipt)=>{
            console.log(`Confirminng blocks ${transactionReceipt.confirmations}`);
            resolve()
        })
    })
}

const get_balance_func = async()=>{
    if(!is_eth_compatible()) return false;
    // getting the provider and balance of the contract
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let balance = await provider.getBalance(Fundme_address);

    console.log(`Contract Balance => ${ethers.utils.formatEther(balance)}`);
}

const withdraw = async()=>{
    if(!is_eth_compatible()) return false;
    // with-drawing the funds from the contract
    let provider = new ethers.providers.Web3Provider(window.ethereum);
    let my_contract = new ethers.Contract(Fundme_address, abi, (await provider.getSigner()));
    console.log("withdrawing the Funds from the contract...");
    let my_withdraw_tx = await my_contract.withdraw();
    await listenforTransactionConfirmation(my_withdraw_tx, provider);
    console.log("transaction mined...");
}

// creating the main function the fund function here
const fund = async()=>{
    let eth_value = (input_ele.value == "") ? "0.1" : input_ele.value;
    if (!is_eth_compatible()) return false;
    console.log("Working");
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    // Getting the contract here now 
    const fundme_contract = new ethers.Contract(Fundme_address, abi, signer);
    try{
        const fundme_tx = await fundme_contract.fund({
            value: ethers.utils.parseEther(`${eth_value}`)
        });
        await listenforTransactionConfirmation(fundme_tx, provider);
        console.log("Doned");
    }
    catch (e){
        console.log(e);
    }

    console.log("Doing funding...");
}

// getting all the buttons here
var buts_one = document.getElementsByTagName('button')[0]
var fund_button = document.getElementById("fund_button")

buts_one.onclick = connect_button;
fund_button.onclick = fund;
getBalance.onclick = get_balance_func;
withdraw_button.onclick = withdraw;