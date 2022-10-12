const { ethers } = require("hardhat")
//chai already got installed with the previous ones we installed
const { expect, assert } = require("chai")



// describe("SimpleStorage", () => {})

//describe is the methd that takes ( sting,function)
describe("SimpleStorage", function () {

  //initializing with let so rest can access out of beforeEach
  let simpleStorageFactory, simpleStorage

//whatever we want to do bfr testing of contract is written in beforeEach like deployment etc

  beforeEach(async function () {
    simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
    simpleStorage = await simpleStorageFactory.deploy()
  })

  //it is where we will write tests, no of test equal to no of it

  //it takes string(what it will do) and function that actually does that
  it("Should start with a favorite number of 0", async function () {
    const currentValue = await simpleStorage.retrieve()

    //we initialized with zero
    const expectedValue = "0"
    // assert
    // expect

    //now to actually test we have twi keywords assert and expect n its our choice to use any of them
    //both below are equivalent

    assert.equal(currentValue.toString(), expectedValue)
    // expect(currentValue.toString()).to.equal(expectedValue)
  })


//if we want to check only one test multiple times we can add only with that like it.only()

  it("Should update when we call store", async function () {
    const expectedValue = "7"
    const transactionResponse = await simpleStorage.store(expectedValue)
    await transactionResponse.wait(1)

    const currentValue = await simpleStorage.retrieve()
    assert.equal(currentValue.toString(), expectedValue)
  })

  // Extra - this is not in the video
  it("Should work correctly with the people struct and array", async function () {
    const expectedPersonName = "Patrick"
    const expectedFavoriteNumber = "16"
    const transactionResponse = await simpleStorage.addPerson(
      expectedPersonName,
      expectedFavoriteNumber
    )
    await transactionResponse.wait(1)
    const { favoriteNumber, name } = await simpleStorage.people(0)
    // We could also do it like this
    // const person = await simpleStorage.people(0)
    // const favNumber = person.favoriteNumber
    // const pName = person.name

    assert.equal(name, expectedPersonName)
    assert.equal(favoriteNumber, expectedFavoriteNumber)
  })


})