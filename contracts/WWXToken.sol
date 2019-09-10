pragma solidity ^0.5.0;

import "./ERC20Token.sol";
import "./SafeMath.sol";

contract WWXToken is ERC20Token {
    using SafeMath for uint256;

    string public name = "Wowoo Exchange Token";
    string public symbol = "WWX";
    uint8 public decimals = 18;

    uint256 public maxSupply = 4770799141 * 10**uint256(decimals);

    constructor (address issuer) public {
        owner = issuer;
        totalSupply = maxSupply;
        balances[owner] = maxSupply;
        emit Transfer(address(0), owner, maxSupply);
    }

}