// SPDX-License-Identifier: MIT
//Enter Lottery(paying some amount)
//Pick a random number(verifiably random)
// WINNER TO BE SELECTED AT EVERY x MIN->AUTOMATED
// sO WE NEED Chainlink Oracle->Randomness, Automated Execution(Chainlink Keepers)


pragma solidity ^0.8.7;

//https://docs.chain.link/docs/vrf/v2/subscription/examples/get-a-random-number/

//copy pasted second import from ^^
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
//then yarn add --dev @chainlink/contracts

//interface 
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';

//now to implement chainlink keepers we will use this as interface
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);
error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();
error Raffle__RaffleNotOpen();

contract Raffle is VRFConsumerBaseV2,KeeperCompatibleInterface{
    /* Type declarations */
//as we want two state for our lottery as when random no is being calculated, we will not want at that time k new player should come
      enum RaffleState {
        OPEN,//open->0
        CALCULATING //calculating->1
    }

    uint256 private immutable i_entranceFee;

    //storing address of players entered
    //payable bcz we have to pay the winner
    address payable[] private s_players;

    //our cordinator interface for request random words
    //wl be once set in contructor
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS=3;
    uint32 private constant NUM_WORDS=1;


    /*Lottery Variable*/
    uint256 private immutable i_interval;
   address private s_recentWinner;
   RaffleState private s_raffleState;
   //so we can compare time
   uint256 private s_lastTimeStamp;

    /* Events */
    //convention for naming event is to put alternate(swapped) name...i.e this is for enterRaffle so we make it RaffleEnter
    event RaffleEnter( address indexed  player);
   
   event RequestRaffleWinner(uint256 indexed requestId);

   event WinnerPicked(address indexed player);

//vrfCoordinatorV2 ->ADDRESS OF CONTRACT THAT DOES RANDOME NO VERFICATION
//see in samplecontract
    constructor (
        address vrfCoordinatorV2,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
         uint256 interval
          ) 
    
    VRFConsumerBaseV2(vrfCoordinatorV2) {
       i_entranceFee=entranceFee;
       i_vrfCoordinator=VRFCoordinatorV2Interface(vrfCoordinatorV2);
       i_gasLane=gasLane;
       i_interval = interval;
       i_subscriptionId=subscriptionId;
       i_callbackGasLimit=callbackGasLimit;
       s_raffleState=RaffleState.OPEN;
       //putting curent time in it
        s_lastTimeStamp = block.timestamp;
       
    }
    function enterRaffle() public payable {
     if(msg.value< i_entranceFee){revert Raffle__NotEnoughETHEntered();}
    
     if (s_raffleState != RaffleState.OPEN) {
            revert Raffle__RaffleNotOpen();
        }
     //he said msg.sender is not type of address to whih we could pay,so we have to typecast it with payable
     s_players.push(payable(msg.sender));


     emit RaffleEnter(msg.sender);

    }








   /**
     * @dev This is the function that the Chainlink Keeper nodes call
     * they look for `upkeepNeeded` to return True.
     * the following should be true for this to return true:
     * 1. The time interval has passed between raffle runs.
     * 2. The lottery is open.
     * 3. The contract has ETH.
     * 4. Implicity, your subscription is funded with LINK.
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override

        //got reference from sample contract
        //returning in the form of bytes is so powerful but since we don't use performData explicitly so commented ou that
        returns (
            bool upkeepNeeded,
            
            bytes memory /* performData */
        )
    {
        bool isOpen = RaffleState.OPEN == s_raffleState;
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers);
        return (upkeepNeeded, "0x0"); // can we comment this out?
    }







//we will not to like picking random no and awarding in one function as brute force can easily damage that
//we will break this process into two step, one first requesting random no, then sending the winner in other one


//this function doesn't required to be public as we will not interact with it
//it will be called by chainlink keeper itself hence made external to make it cheap

//we changed requestRandomwinner into performkeepup
  function performUpkeep(
        bytes calldata /* performData */
    ) external override {

   //first we wl chk if checkKeepup is true then only it runs
        (bool upkeepNeeded, ) = checkUpkeep("");
        // require(upkeepNeeded, "Upkeep not needed");

        //given all three in arguments to let people know why reverted
        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
     //request the random winner
     //once we get it,do something with it
     //2 transaction process

        //SO aanyone can't enter
        s_raffleState=RaffleState.CALCULATING;
        //pasted from vrf SAMPLE Contractbut modified acc
        //it returns id with other data
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,//was keyhash actually, he gas lane key hash value, which is the maximum gas price you are willing to pay for a request in wei.
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,//How many confirmations the Chainlink node should wait before responding. The longer the node waits, the more secure the random value is
            i_callbackGasLimit,
            NUM_WORDS
        );

        emit RequestRaffleWinner(requestId);
    }







//THIS FUNCTION WILL BE OVERRIDEN BY VRFConsumerBaseV2 function of fulfillRandomWords 
  function fulfillRandomWords(
  uint256 /*requestId*/, //means this funct need uint256(as requestId) but no requestid explicitly used
  uint256[] memory randomWords) 
  
  internal override {


//random no will come in an array but we have requested only one here
//but no could be like 15484878515845784878784577878454877844959.... so long
//for getting thewinner from array of s_players we wl use modulo (remainder)
//eg s_players have 10 size and random no is 202 then 202%10=2
//we will divide the no with array size here 10 so we can always have no betwwen 0-9 


//[0] as we have requested one no
uint256 indexOfWinner=randomWords[0] % s_players.length;
///now using above index we will get the address

address payable recentWinner =s_players[indexOfWinner];
s_recentWinner=recentWinner;

//resetting array
s_players = new address payable[](0);
//NOW OPEN IT
s_raffleState=RaffleState.OPEN;
//
 s_lastTimeStamp = block.timestamp;

//sending balance
(bool success, ) = recentWinner.call{value: address(this).balance}("");
        // require(success, "Transfer failed");
        if (!success) {
            revert Raffle__TransferFailed();
        }

        //keep tracking of recent winner
        emit WinnerPicked(recentWinner);
  }



 function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }


//since num_words is not in storage it is constant, thats why we made it pure
    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

function getPlayer(uint256 index) public view returns (address){
    return s_players[index];
}

    function getEntranceFee() public view returns(uint256){
        return i_entranceFee;
    }


     function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }


    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    
    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }


    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }


}