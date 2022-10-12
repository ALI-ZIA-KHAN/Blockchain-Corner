// imports
//RUN ALLOWS US TO RUN ANY HARDHAT TASK/COMMAND
const { ethers, run, network } = require("hardhat")

// async main
async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
  console.log("Deploying contract...")
  const simpleStorage = await SimpleStorageFactory.deploy()
  await simpleStorage.deployed()
  console.log(`Deployed contract to: ${simpleStorage.address}`)
  //^^WE DEPLOYED OUR CONTRACT BUT WE DIDN'T HAVE PRIVATE KEY AND RPC URL,
  //HOW?
  //AS IF WE DON'T MENTION THESE THINGS THE HARDHAT WILL DEPLOY IT TO DUMMY NODE ITSELF



  //WANT to know and check if we deploy it on testnet/mainnet as by default hardhat deploys it on local network
  //and we can't verify that on etherscan obv
  //so here come the use of chainId , IF THERE IS chainId of test/main net we check it here

  //if we deploy using yarn hardhat run scripts/deploy.js ->(no network name)
  //means it will deploy on default hardhat network
  //whereby console.log(network.config) will show chainId diff (of hardHat)



  //since we have configured gOERLI IN CONFIG we can get its chainId from chainlist.org that is 5
  //and we run yarn hardhat run scripts/deploy.js --network goerli
  //it will dpeloy on goerli
// now want to check if Key exists and network Id is same


  if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...")
    //asietherscan takes time so we should wait for some blocks to mined first
    await simpleStorage.deployTransaction.wait(6)

    //now we are passing address and constr argu which for now are not there
    await verify(simpleStorage.address, [])
  }



  //now this is interacting with contract then

  const currentValue = await simpleStorage.retrieve()
  console.log(`Current Value is: ${currentValue}`)

  // Update the current value
  const transactionResponse = await simpleStorage.store(7)
  await transactionResponse.wait(1)
  const updatedValue = await simpleStorage.retrieve()
  console.log(`Updated Value is: ${updatedValue}`)
}

// async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
  console.log("Verifying contract...")

  //since already verified contract wil cause an error upon verifying again so we use try catch and
  //it can move on
  try {
    //run is use to trigger tasks of hardhat here it is verify
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
      //args for now are none
    })
  } catch (e) {

    //this is the message displayed when verified already so we check like this
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!")
    } else {
      console.log(e)
    }
  }
}

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })