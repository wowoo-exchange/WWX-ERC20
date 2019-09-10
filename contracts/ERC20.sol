pragma solidity ^0.5.0;

/**
 * @title Interface of the ERC20 standard as defined in the EIP.
 * @dev https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 {

    uint256 public totalSupply;
    function balanceOf(address account) public view returns (uint256);
    function transfer(address recipient, uint256 amount) public returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool);
    function approve(address spender, uint256 amount) public returns (bool);
    function allowance(address owner, address spender) public view returns (uint256);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

}