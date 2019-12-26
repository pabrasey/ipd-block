pragma solidity ^0.5.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "../node_modules/@openzeppelin/contracts/ownership/Ownable.sol";

contract PPCToken is ERC20Mintable, ERC20Detailed {

    constructor()
    ERC20Detailed("PPCToken", "PPC", 0) // there is no defaultOperators -> empty array
    public
    {
        _mint(msg.sender, 0); // initial supply is 0
    }

}