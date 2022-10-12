//Enter Lottery(paying some amount)
//Pick a random number(verifiably random)
// WINNER TO BE SELECTED AT EVERY x MIN->AUTOMATED
// sO WE NEED Chainlink Oracle->Randomness, Automated Execution(Chainlink Keepers)


pragma solidity ^0.8.7;

//https://docs.chain.link/docs/vrf/v2/subscription/examples/get-a-random-number/

//copy pasted second import from ^^
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
//then yarn add --dev @chainlink/contracts


Raffle__NotEnoughETHEntered();

contract Raffle is VRFConsumerBaseV2{

    uint256 private immutable i_entranceFee;

    //storing address of players entered
    //payable bcz we have to pay the winner
    address payable[] private s_players[]


    /* Events */
    //convention for naming event is to put alternate(swapped) name...i.e this is for enterRaffle so we make it RaffleEnter
    event RaffleEnter(address indexed player)

    constructor (uint256 entranceFee){
       i_entranceFee=entranceFee 

    }
    function enterRaffle() public payable {
     if(msg.value<entranceFee){revert Raffle__NotEnoughETHEntered();}
    
     //he said msg.sender is not type of address to whih we could pay,so we have to typecast it with payable
     s_players.push(payable(msg.sender))


     emit RaffleEnter(msg.sender)

    }

//we will not to like picking random no and awarding in one function as brute force can easily damage that
//we will break this process into two step, one first requesting random no, then sending the winner in other one


//this function doesn't required to be public as we will not interact with it
//it will be called by chainlink keeper itself hence made external to make it cheap
    function requestRandomWinner() external{
     //request the random winner
     //once we get it,do something with it
     //2 transaction process
    }

//THIS FUNCTION WILL BE OVERRIDEN BY 
  function fulfillRandomWinner() internal override {

  }

function getPlayer(uint256 index) public view returns (address){
    return s_players[index]
}

    function getEntranceFee() public view returns(uint256){
        return i_entranceFee
    }
}