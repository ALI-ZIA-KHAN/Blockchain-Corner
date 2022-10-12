//tasks folder is what we created 
//i orderr to specify taks that can be done by hardhat separately

const { task } = require("hardhat/config")


task("block-number", "Prints the current block number").setAction(
  
//.setAction ->what it should do so we make async func in it


  //for now we are not passing args
  //hre is just like hardhat from which we get diff things, like require("hardhat") in  const { ethers} = require("hardhat")
  async (taskArgs, hre) => {
    const blockNumber = await hre.ethers.provider.getBlockNumber()
    console.log(`Current block number: ${blockNumber}`)
  }
)

module.exports = {}