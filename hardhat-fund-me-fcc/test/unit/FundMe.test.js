const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")


//this includes with ternary means 
//wen only want to run this unit test when we r on development chains

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe
          let mockV3Aggregator
          let deployer

          //parseEther(1) will make it 10000000000000000
          const sendValue = ethers.utils.parseEther("1")

          //allthings bfr testing now
          beforeEach(async () => {


            //now if we would be deploying on harhat env it would have given 10 given acc
            //n we are using 1st to deploy
              // const accounts = await ethers.getSigners()
              // deployer = accounts[0]

              //getNamedAcc is eqv to another way of getting acc from config by ethers.getSigners
              //here assigning whole deployer onj to deployer var
              deployer = (await getNamedAccounts()).deployer

              //fixture is a method to run all deploy scripts
              await deployments.fixture(["all"])
                  
              //getContract will give us the latest deployed contract
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })
               
          //constructor testing nested describe we have
          describe("constructor", function () {
              it("sets the aggregator addresses correctly", async () => {

                //checking if right address has been put in
                  //priceFeed() is public Aggregeararot variable
                //   const response = await fundMe.PriceFeed()
             
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
        
          //testing fund function
          describe("fund", function () {
              // https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
              // could also do assert.fail

              //instead of assert we used expect as incase of error it will be reverted with thorown error
              //expect is from waffle
              //if there would be no funds it will show us that it is reverted
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              // we could be even more precise here by making sure exactly $50 works
              // but this is good enough for now
              //first putting some hardcoded amount
              it("Updates the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )

                  //since it will be bign=Numbers do we made them two strings
                  //and compare them
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunder(0)
                  assert.equal(response, deployer)
              })
          })
          describe("withdraw", function () {

            //bfr withdraw we shoulld have fund
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              //if there is single funder
              it("withdraws ETH from a single funder", async () => {
                  // Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                   
                   //we came to know about these two terms gasUsed,effGaspr by breakpoints(debugging of vs code)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt

                  //mul is basically opcode for multiply
                  //since gas would also be spent in withdrawal we  should be having gas amount as well to comapre the amount later
                  const gasCost = gasUsed.mul(effectiveGasPrice)


                  //we have got now both starting and endingw balance 

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  // Maybe clean up to understand the testing


                  //now after withdrawal it should be zero
                  assert.equal(endingFundMeBalance, 0)

                  //we basically used opcode add instead of plus(as they are blockchain BigNumber)
                  //added gascost and then comapring
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
              // this test is overloaded. Ideally we'd split it into multiple tests
              // but for simplicity we left it as one


              //this is now tp check if there are multiplen funders
              it("is allows us to withdraw with multiple funders", async () => {
                  // Arrange


                  //got dummy accounts 
                  const accounts = await ethers.getSigners()

                  //for now took 6
                  for (i = 1; i < 6; i++) {

                    //connected these acc to the contract in loop
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )

                      //sending balance from these accounts
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }


                  //same checking starting and ending balance
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  // Let's comapre gas costs :)
                  // const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait()
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const withdrawGasCost = gasUsed.mul(effectiveGasPrice)



//we can also use console.log in hardhat by importing console

                  console.log(`GasCost: ${withdrawGasCost}`)
                  console.log(`GasUsed: ${gasUsed}`)
                  console.log(`GasPrice: ${effectiveGasPrice}`)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(withdrawGasCost).toString()
                  )
                  //same till above^^^



             
                  // Make a getter for storage variables
                  //after resetting we shouldn't found this true
                  await expect(fundMe.getFunder(0)).to.be.reverted
                     


                  //setting all to zero
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })



              //tsting modifier
              it("Only allows the owner to withdraw", async function () {

                //getting the which is not the deployer hence not the owbner
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )

                  //so it should get revereted with exception
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe_NotOwner")
              })
          })
      })



      //do run yarn hardhat test