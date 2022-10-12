// function deployFunc(){
//     console.log("Hi")
// }



// module.exports.default = deployFunc()



const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
//destructing parameters from hre basically 

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //now to check on which network we are on so to correspondingly select the address for conversion
    //we use aave protocol
    //made heplper-harhat-congig.js
    //define chainId, address etcc there and get it here then acc to that get the address

  


//now consider we are working on a network whose pricefeed address doesn;t exist even like local or hardhat
//Here comes the role of "Mocks", we design ours instead of established one
//for this we created 00-dep in deploy as tis is just like pre deploy what we do before using actual ones
//

  //this is how we can get that network
    // ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    //but we will not make it constant so used let
    let ethUsdPriceFeedAddress

    //now wwe will check if its on local then run our local aggreagator
    //else of that network priceFeed
    //greate this is best script to deploy as it will automatically check and run everytime, no neeed to change 

    if (chainId == 31337) {
        //deployement.get will get the latest one deployed
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    //in oreder to verify before deploying on actual testnets
    //we created utils folder and verify file and copy pasted code from previous project

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
}

module.exports.tags = ["all", "fundme"]
