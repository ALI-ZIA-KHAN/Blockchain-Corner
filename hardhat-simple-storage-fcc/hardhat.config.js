require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("./tasks/block-number")
//shows the gas report, we see detial report in terms of usd by using COINMARKETCAP Api key
require("hardhat-gas-reporter")
//how much code is tested it tells
require("solidity-coverage")

/** @type import('hardhat/config').HardhatUserConfig */

//by default hardhat deploy on dummy node


//but you can explicitly give credentials

const GOERLI_RPC_URL=process.env.GOERLI_RPC_URL
const PRIVATE_KEY=process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY=process.env.ETHERSCAN_API_KEY
const COIN_MARKET_API_KEY=process.env.COIN_MARKET_API_KEY

//see comments on deploy.js
module.exports = {
  defaultNetwork:"hardhat",
  networks:{
    goerli:{
      url:GOERLI_RPC_URL,
      accounts:[PRIVATE_KEY],
      chainId:5
    },
    //localhost is somewhat diff from harhat above network,it is provided on local   ,dummmy accounts just like ganache
    // run yarn hardhat node->tosee accounts,url etc
    localhost:{
      url:"http://127.0.0.1:8545/",
      chainId:31337
    }
    //after this run yarn hardhat run scripts/deploy.js --network localhost
  },
  solidity: "0.8.8",
  etherscan:{
    apiKey:ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COIN_MARKET_API_KEY,
  },
};

