pragma solidity >=0.7.0;
// SPDX-License-Identifier: Apache 2.0

interface TRC20_Interface {

    function allowance(address _owner, address _spender) external view returns (uint remaining);

    function transferFrom(address _from, address _to, uint _value) external returns (bool);

    function transfer(address direccion, uint cantidad) external returns (bool);

    function balanceOf(address who) external view returns (uint256);

    function decimals() external view returns(uint);
}