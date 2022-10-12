// 1-> Pragma
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
//copied contract from lesson from remix FunMe2 with some things from fundme3 for style guide

//2->Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// this contract is when u make all conversion functions
//as library and use it

//3->Natspec
// /**@title A crowd funding contract
//  * @author Ali Zia Khan
//  * @dev This implements price feeds as our library
//  */

//4->Error
error FundMe_NotOwner();

contract FundMe {
    //5->Type Declarations
    using PriceConverter for uint256;

    //->State Variables
    //as getconvrate will return in 18 deci

    uint256 public minimumUsd = 50 * 1e18;
    //we made it private as we don't need to make it public var to consume large gas
    address[] private funders;

    //changes to private
    mapping(address => uint256) private addressToAmountFunded;

    //added
    //basically in oreder to convert we were using hardcoded address from chainLink
    //what when we have to change it? everytime change hardcoded one ?NO
    //plus in remix we were importing it directly and running it on online network
    //so how to use that in local?

    //so we have now change that hardcoded by passing the address dynamically
    //loading in constructor then passing into converter contract in getaPrice function as second arg

    //public variable
    //changed to privete
    AggregatorV3Interface private priceFeed;

    //changed  public to private
    address private owner;

    //7->Events
    //8->Modifiers

    modifier onlyOwner() {
        // require(msg.sender==i_owner,"Sender is not owner !");
        if (msg.sender != owner) {
            revert FundMe_NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        //in order to let owner be the one who can withdraw
        owner = msg.sender;

        //added
        //passing address to priceFeed variable in constructor
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    function fund() public payable {
        //we wrote msg.value.getConv insted  getConv(msg.value)
        // as first arg will be given always like arg.function(if multile then all except first give herein parenthesis as usual)
        //priceFeed is now given as 2nd parameter to that contract
        require(
            msg.value.getConversionRate(priceFeed) >= minimumUsd,
            "You need to spend more ETH!"
        );
        // now to store all senders address
        funders.push(msg.sender);
        //settinf map values
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            //get the address of the funder
            address funder = funders[funderIndex];
            //now setting its fund to 0 in map via address
            addressToAmountFunded[funder] = 0;
        }

        //completely RESETtin THE ARRAY with 0 elements
        funders = new address[](0);

        //actually withdraw the amount
        //3 ways

        //transfer //send //call

        payable(msg.sender).transfer(address(this).balance);

        bool sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess, " Send failed ");

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }


//all four public var which we chaged to private as user doesn't need the storage (high gas) instead we made getters
    function get_Owner() public view returns(address){
        return owner;
    }

    function getFunder(uint256 index) public view returns(address){
       return funders[index];
    }

    function getAddressToAmountFunded(address funder) public view returns (uint256) {
       return  addressToAmountFunded[funder];

    }

    function getPriceFeed() public view returns (AggregatorV3Interface){
        return priceFeed;
    }
}
