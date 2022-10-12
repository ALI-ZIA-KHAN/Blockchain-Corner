//this file means mock are jsut created when we use network that doesn't have there own pricefeed(we r doing conversion since)
//like local or hardhat, so cope up that we create by ourselves , since we don't this on networks which already have pricefeeds
//like rinkbey ethereum, we gave it 00 as it is just like pre deploy when we test it on working on established one


const { network } = require("hardhat")

//decimal and initial price are parameter for our Mock Aggregator
//instead passing directly in deploy we have made them here
//or u can have them in helper then import 

const DECIMALS = "8"
const INITIAL_PRICE = "200000000000" // 2000
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    //log is just console.log
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // If we are on a local development network, we need to deploy mocks!

    //31337 bcz this script is for hardhat
    //or instead of 31337 u can have network.name
    //or yiou can give network.name as we have specified name in helper
    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...")


        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            //for console
            log: true,
            //giving arguments to contructor of MOCK CONTRACT
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks Deployed!")
        log("------------------------------------------------")
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
            "Please run `npx hardhat console` to interact with the deployed smart contracts!"
        )
        log("------------------------------------------------")
    }
}
module.exports.tags = ["all", "mocks"]
//in order to run only this mock script we use tags
//so when now u give
//yarn hardhat deploy --tags mocks 
//it will only run this