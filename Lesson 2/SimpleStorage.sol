// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract SimpleStorage{
//basic types boolean,uint,int,address,bytes,string
//uint,int canbe in 8-256
//bytes 1-32

//autom intializes to zero;
uint256 public favouriteNumber;


//mapping
mapping (string => uint256) public nameToFavouriteNumber;

struct People{
    uint256 favouriteNumber;
    string name;
}

People public person=People({
    favouriteNumber:2,
    name:"Ali"
});

//array
// uint256[] public favouriteNumberList;
//if u dont give size the it is dynamic
People[] public people;

function store(uint256 _favouriteNumber) public {
  favouriteNumber=_favouriteNumber;
  //now just adding below line function will become more complex andwl use gas fees more
  favouriteNumber=favouriteNumber+1;
}

//view -> only readable ,pure ->not even read
function retreive() public view returns(uint256){
    return favouriteNumber;
}

//pure and view function(read only) doesn't require gas fee but some oter cost maybe(to confirm)
//only those funcction which changes state requires gas fees
function add() public pure returns(uint256){
    return(1+1);
}

function addPerson ( uint256 _favouriteNumber,string memory _name  ) public {
    //u can push directly but we are storing it in variable then pushing
    People memory newPerson=People({favouriteNumber:_favouriteNumber,name: _name});
   
    //push is the method
    people.push(newPerson) ;


     //adding to map
    nameToFavouriteNumber[_name]= _favouriteNumber;

}



}