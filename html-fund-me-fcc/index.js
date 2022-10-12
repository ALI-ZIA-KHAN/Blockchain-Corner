//since we are not doing node version here code is acc to simple js

//went to ethers browser cdn open that pasted by making a new file eth-5.6 and imported that
// import {ethers} from '../html-fund-me-fcc/ethers-5.6-esm.min.js'

// async function connect() {
//     if (typeof window.ethereum !== "undefined") {
//       try {
//         await ethereum.request({ method: "eth_requestAccounts" })
//       } catch (error) {
//         console.log(error)
//       }
//       connectButton.innerHTML = "Connected"
//       const accounts = await ethereum.request({ method: "eth_accounts" })
//       console.log(accounts)
//     } else {
//       connectButton.innerHTML = "Please install MetaMask"
//     }
//   }


  import { ethers } from "../html-fund-me-fcc/ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"


//changed type to module in html so don't have to write onclick there instead u can have onclick here

const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect
// withdrawButton.onclick = withdraw
fundButton.onclick = fund
// balanceButton.onclick = getBalance


console.log("ethers",ethers)
async function connect() {
  //since wallets are injected in browser window we ca access it via window object
  if (typeof window.ethereum !== "undefined") {
    //for opening metaamsk and connect it
    try {
      await ethereum.request({ method: "eth_requestAccounts" })
    } catch (error) {
      console.log(error)
    }
    connectButton.innerHTML = "Connected"
    const accounts = await ethereum.request({ method: "eth_accounts" })
    console.log(accounts)
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

// async function withdraw() {
//   console.log(`Withdrawing...`)
//   if (typeof window.ethereum !== "undefined") {
//     const provider = new ethers.providers.Web3Provider(window.ethereum)
//     await provider.send('eth_requestAccounts', [])
//     const signer = provider.getSigner()
//     const contract = new ethers.Contract(contractAddress, abi, signer)
//     try {
//       const transactionResponse = await contract.withdraw()
//       await listenForTransactionMine(transactionResponse, provider)
//       // await transactionResponse.wait(1)
//     } catch (error) {
//       console.log(error)
//     }
//   } else {
//     withdrawButton.innerHTML = "Please install MetaMask"
//   }
// }



//for fund func we need
//provider/connecton to Bc
//signer/wallet/someone with gas
//contract that we are interacting with
//^ABI and Address


async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {

    //Web3Provider(window.ethereum) is same as JSON RPC url etting you the endpoint
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    //it will provide the signer like if in metamask account 1 is conected , then account 1 will be signer
    const signer = provider.getSigner()


    //WE GOT ABI FROM PREVIOUS PROJECT ARTIFACTS FUNDME.JSON
    //aLSO RAN yarn hardhat node, got the addresss where contract get deployed
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

// async function getBalance() {
//   if (typeof window.ethereum !== "undefined") {
//     const provider = new ethers.providers.Web3Provider(window.ethereum)
//     try {
//       const balance = await provider.getBalance(contractAddress)
//       console.log(ethers.utils.formatEther(balance))
//     } catch (error) {
//       console.log(error)
//     }
//   } else {
//     balanceButton.innerHTML = "Please install MetaMask"
//   }
// }

// function listenForTransactionMine(transactionResponse, provider) {
//     console.log(`Mining ${transactionResponse.hash}`)
//     return new Promise((resolve, reject) => {
//         try {
//             provider.once(transactionResponse.hash, (transactionReceipt) => {
//                 console.log(
//                     `Completed with ${transactionReceipt.confirmations} confirmations. `
//                 )
//                 resolve()
//             })
//         } catch (error) {
//             reject(error)
//         }
//     })
// }