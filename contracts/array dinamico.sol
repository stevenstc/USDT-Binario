pragma solidity >=0.7.0;
// SPDX-License-Identifier: Apache 2.0


contract arraySuma{
    
    function actualizarNetwork(address[] memory oldNetwork)public pure returns ( address[] memory) {
        address[] memory newNetwork =   new address[](oldNetwork.length+1);
    
        for(uint i = 0; i < oldNetwork.length; i++){
            newNetwork[i] = oldNetwork[i];
        }
        
        return newNetwork;
    }
    
    function allnetwork( address[] memory network) public pure returns ( address[] memory) {

        network = actualizarNetwork(network);

        network[network.length-1] = address(2);
        
        network = actualizarNetwork(network);
    
        network[network.length-1] = address(3);
        
        network = actualizarNetwork(network);
        
        network[network.length-1] = address(4);


    return network;
  }
}