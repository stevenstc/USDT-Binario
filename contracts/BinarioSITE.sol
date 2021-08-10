pragma solidity >=0.7.0;
// SPDX-License-Identifier: Apache 2.0

import "./SafeMath.sol";
import "./InterfaseTRC20.sol";
import "./Ownable.sol";

contract SITEBinary is Ownable{
  using SafeMath for uint256;

  TRC20_Interface USDT_Contract;

  TRC20_Interface SALIDA_Contract;

  TRC20_Interface OTRO_Contract;

  struct Hand {
    uint256 reclamados;
    uint256 lost;
    address referer;
  }

  struct Investor {
    bool registered;
    bool recompensa;
    uint256 plan;
    uint256 balanceRef;
    uint256 totalRef;
    uint256 amount;
    uint256 almacen;
    uint256 inicio;
    uint256 invested;
    uint256 paidAt;
    uint256 withdrawn;
    uint256 directos;
  }

  uint256 public MIN_RETIRO = 1*10**8;
  uint256 public MIN_RETIRO_interno;

  address public tokenPricipal;
  address public tokenPago;

  uint256 public rate = 1680000;
  uint256 public rate2 = 1680000;

  uint256 public porcientoBuy = 100;
  uint256 public porcientoPay = 100;

  uint256[5] public primervez = [100, 0, 0, 0, 0];

  uint256[5] public porcientos = [0, 0, 0, 0, 0];

  uint256[16] public plans = [0, 25*10**8, 50*10**8, 100*10**8, 300*10**8, 500*10**8, 1000*10**8, 2000*10**8, 5000*10**8, 100000*10**8, 1000000*10**8, 2000000*10**8, 3000000*10**8, 5000000*10**8, 1000000000*10**8, 2000000000*10**8];

  uint256 public basePorcientos = 1000;

  bool public sisReferidos = true;
  bool public sisBinario = true;

  uint256 public dias = 1;
  uint256 public unidades = 86400;
  uint256 public maxTime = 90;
  uint256 public porcent = 200;
  uint256 public porcentPuntosBinario = 10;

  uint256 public totalInvestors;
  uint256 public totalInvested;
  uint256 public totalRefRewards;

  mapping (address => Investor) public investors;
  mapping (address => address) public padre;
  mapping (address => Hand) public handLeft;
  mapping (address => Hand) public handRigth;
  mapping(uint256 => address) public idToAddress;
  mapping(address => uint256) public addressToId;
  
  uint256 public lastUserId = 2;
  address public api;

  constructor(address _tokenTRC20) {
    (USDT_Contract, SALIDA_Contract) = (TRC20_Interface(_tokenTRC20), TRC20_Interface(_tokenTRC20));

    (tokenPricipal, tokenPago) = (_tokenTRC20, _tokenTRC20);

    Investor storage usuario = investors[owner];
    api = owner;

    ( usuario.registered, usuario.recompensa ) = (true,true);

    totalInvestors++;

    idToAddress[1] = msg.sender;
    addressToId[msg.sender] = 1;

  }

  function setRateBuy(uint256 _rate) public {

    require( owner == msg.sender || api == msg.sender, "No tienes autorizacion");

    rate = _rate;

  }

  function setRateSell(uint256 _rate) public {

    require( owner == msg.sender || api == msg.sender, "No tienes autorizacion");

    rate2 = _rate;

  }

  function rateSell() public view returns(uint256){

    if (tokenPricipal == tokenPago || rate == rate2 ) {
      return rate;
    } else {
      return rate2;
    }

  }

  function setWalletApi(address _wallet) public onlyOwner returns(address){

    api = _wallet;

    return _wallet;

  }

  function setporcientoBuyPay(uint256 _buy ,uint256 _pay) public onlyOwner returns(uint256, uint256){

    porcientoBuy = _buy;
    porcientoPay = _pay;
    return (_buy, _pay);

  }

  function setPuntosPorcentajeBinario(uint256 _porcentaje) public onlyOwner returns(uint256){

    porcentPuntosBinario = _porcentaje;

    return _porcentaje;
  }

  function setMIN_RETIRO(uint256 _min) public onlyOwner returns(uint256){

    MIN_RETIRO = _min;

    return _min;

  }

  function ChangeTokenPrincipal(address _tokenTRC20) public onlyOwner returns (bool){

    USDT_Contract = TRC20_Interface(_tokenTRC20);

    tokenPricipal = _tokenTRC20;

    return true;

  }

  function ChangeTokenSalida(address _tokenTRC20) public onlyOwner returns (bool){

    SALIDA_Contract = TRC20_Interface(_tokenTRC20);

    tokenPago = _tokenTRC20;

    return true;

  }

  function ChangeTokenOTRO(address _tokenTRC20) public onlyOwner returns (bool){

    OTRO_Contract = TRC20_Interface(_tokenTRC20);

    return true;

  }

  function setstate() public view  returns(uint256 Investors,uint256 Invested,uint256 RefRewards){
      return (totalInvestors, totalInvested, totalRefRewards);
  }

  function InContractSITE() public view returns (uint256){
    return USDT_Contract.balanceOf(address(this));
  }

  function InContractOTRO() public view returns (uint256){
    return OTRO_Contract.balanceOf(address(this));
  }

  function InContractTRX() public view returns (uint256){
    return address(this).balance;
  }
  
  function tiempo() public view returns (uint256){
     return dias.mul(unidades);
  }

  function verPlan(uint256 _nivel) public view returns (uint256){
    return plans[_nivel];
  }

  function setPorcientos(uint256 _value_1, uint256 _value_2, uint256 _value_3, uint256 _value_4, uint256 _value_5) public onlyOwner returns(uint256, uint256, uint256, uint256, uint256){

    porcientos = [_value_1, _value_2, _value_3, _value_4, _value_5];

    return (_value_1, _value_2, _value_3, _value_4, _value_5);

  }

  function setPrimeravezPorcientos(uint256 _value_1, uint256 _value_2, uint256 _value_3, uint256 _value_4, uint256 _value_5) public onlyOwner returns(uint256, uint256, uint256, uint256, uint256){

    primervez = [_value_1, _value_2, _value_3, _value_4, _value_5];

    return (_value_1, _value_2, _value_3, _value_4, _value_5);

  }

  function setPlans(uint256 _level,uint256 _value) public onlyOwner returns(uint256, uint256){
    plans[_level] = _value * 10**8;
    return (_level, _value);
  }


  function setTiempo(uint256 _dias) public onlyOwner returns(uint256){

    dias = _dias;
    
    return (_dias);

  }

  function setTiempoUnidades(uint256 _diasHorasSegundos) public onlyOwner returns(uint256){

    unidades = _diasHorasSegundos;
    
    return (_diasHorasSegundos);

  }

  function setMaxTime(uint256 _porcentajemaximoParahacerUpgrade) public onlyOwner returns(uint256){

    maxTime = _porcentajemaximoParahacerUpgrade;
    
    return (_porcentajemaximoParahacerUpgrade);

  }

  function setBase(uint256 _base100) public onlyOwner returns(uint256){

    basePorcientos = _base100;
    
    return (_base100);

  }

  function controlReferidos(bool _true_false) public onlyOwner returns(bool){

    sisReferidos = _true_false;
    
    return (_true_false);

  }

  function controlBinario(bool _true_false) public onlyOwner returns(bool){

    sisBinario = _true_false;
    
    return (_true_false);

  }

  function setRetorno(uint256 _porcentaje) public onlyOwner returns(uint256){

    porcent = _porcentaje;

    return (porcent);

  }

  function column (address yo) public view returns(address[5] memory res) {

    res[0] = padre[yo];
    yo = padre[yo];
    res[1] = padre[yo];
    yo = padre[yo];
    res[2] = padre[yo];
    yo = padre[yo];
    res[3] = padre[yo];
    yo = padre[yo];
    res[4] = padre[yo];
    yo = padre[yo];

    return res;
  }

  function rewardReferers(address yo, uint256 amount, uint256[5] memory array) internal {

    address[5] memory referi = column(yo);
    uint256[5] memory a;
    uint256[5] memory b;

    for (uint256 i = 0; i < 5; i++) {

      Investor storage usuario = investors[referi[i]];
      if (usuario.registered && array[i] != 0 && usuario.recompensa){
        if ( referi[i] != address(0) ) {

          b[i] = array[i];
          a[i] = amount.mul(b[i]).div(basePorcientos);

          if (usuario.amount >= a[i]) {
            usuario.amount -= a[i];
            usuario.balanceRef += a[i];
            usuario.totalRef += a[i];
            totalRefRewards += a[i];
            
          }else{

            usuario.balanceRef += usuario.amount;
            usuario.totalRef += usuario.amount;
            totalRefRewards += usuario.amount;
            usuario.amount = 0;
          }

        }else{
          break;
        }
      }
    }
  }

  function buyValue(uint256 _value ) view public returns (uint256){
    return (_value.mul(10**USDT_Contract.decimals()).div(rate)).mul(porcientoBuy).div(100);
  }

  function payValue(uint256 _value ) view public returns (uint256){
    return (_value.mul(10**SALIDA_Contract.decimals()).div(rateSell())).mul(porcientoPay).div(100);
  }

  function buyPlan(uint256 _plan, address _sponsor, uint256 _hand) public {

    require( _hand <= 1, "mano incorrecta");
    require(_plan <= plans.length && _plan > 0, "plan incorrecto");

    Investor storage usuario = investors[msg.sender];
    if( usuario.inicio != 0 && usuario.inicio.add(tiempo().mul(maxTime).div(100)) >= block.timestamp){
      withdrawInternal();
      upGradePlan(_plan);
    }else{

      if (usuario.inicio == 0 || usuario.inicio.add(tiempo()) <= block.timestamp) {
        uint256 _value = plans[_plan];

        require( USDT_Contract.allowance(msg.sender, address(this)) >= buyValue(_value), "aprovado insuficiente");
        require( USDT_Contract.transferFrom(msg.sender, address(this), buyValue(_value)), "saldo insuficiente" );

        usuario.inicio = block.timestamp;

        usuario.invested += _value;
        usuario.amount += _value.mul(porcent.div(100));
        usuario.plan = _plan;
        
        if (!usuario.registered){

          (usuario.registered, usuario.recompensa) = (true, true);
          padre[msg.sender] = _sponsor;

          if (_sponsor != address(0) && sisBinario ){
            Investor storage sponsor = investors[_sponsor];
            sponsor.directos++;
            Hand storage izquierda = handLeft[_sponsor];
            Hand storage derecha = handRigth[_sponsor];
            if (izquierda.referer == address(0) && _hand == 0  || derecha.referer == address(0) && _hand == 1) {
              if (_hand == 0){
                  izquierda.referer = msg.sender;
              }else{
                  derecha.referer = msg.sender;
              }
              
            } else {

              address[] memory network;

              network = actualizarNetwork(network);

              if (_hand == 0){
                network[0] = izquierda.referer;
                (_hand, _sponsor) = recursiveInsertion(network);
                  
              }else{
                network[0] = derecha.referer;
                (_hand, _sponsor) = recursiveInsertion(network);
                  
              }
              
              if (_hand == 0){
                izquierda = handLeft[_sponsor];
                izquierda.referer = msg.sender;
              }else{
                derecha = handRigth[_sponsor];
                derecha.referer = msg.sender;
              }
              
            }
            
          }

          if (padre[msg.sender] != address(0) && sisReferidos ){
            rewardReferers(msg.sender, _value, primervez);
          }
          
          totalInvestors++;

          idToAddress[lastUserId] = msg.sender;
          addressToId[msg.sender] = lastUserId;
          
          lastUserId++;

        }else{

          if (padre[msg.sender] != address(0) && sisReferidos ){
            rewardReferers(msg.sender, _value, porcientos);
          }
        }

        totalInvested += _value;
        
      } else {
        revert();
      }
    }
  }
  
  function upGradePlan(uint256 _plan) internal {

    Investor storage usuario = investors[msg.sender];
    require (_plan > usuario.plan, "tiene que ser un plan mayor para hacer upgrade");

    uint256 _value = plans[_plan].sub(plans[usuario.plan]);

    require( USDT_Contract.allowance(msg.sender, address(this)) >= buyValue(_value), "aprovado insuficiente");
    require( USDT_Contract.transferFrom(msg.sender, address(this), buyValue(_value)), "saldo insuficiente" );
    
    usuario.inicio = block.timestamp;

    usuario.plan = _plan;
    usuario.amount += _value.mul(porcent.div(100));
    usuario.invested += _value;

     if (padre[msg.sender] != address(0) && sisReferidos ){
       rewardReferers(msg.sender, _value, porcientos);
     }

    totalInvested += _value;
    
  }
  
  function withdrawableBinary(address any_user) public view returns (uint256 left, uint256 rigth, uint256 amount) {
    Investor storage user = investors[any_user];

    Hand storage user_izquierda = handLeft[any_user];
    Hand storage user_derecha = handRigth[any_user];

    Investor storage investor = investors[any_user];
      
    if ( user_izquierda.referer != address(0)) {
        
      address[] memory network;

      network = actualizarNetwork(network);

      network[0] = user_izquierda.referer;

      network = allnetwork(network);
      
      for (uint i = 0; i < network.length; i++) {
      
        user = investors[network[i]];
        left += user.invested;
      }
        
    }
      
    left -= user_izquierda.reclamados.add(user_izquierda.lost);
      
    if ( user_derecha.referer != address(0)) {
        
        address[] memory network;

        network = actualizarNetwork(network);

        network[0] = user_derecha.referer;

        network = allnetwork(network);
        
        for (uint i = 0; i < network.length; i++) {
        
          user = investors[network[i]];
          rigth += user.invested;
        }
        
    }

    rigth -= user_derecha.reclamados.add(user_derecha.lost);

    if (left < rigth) {
      if (left.mul(porcentPuntosBinario).div(100) <= investor.amount ) {
        amount = left.mul(porcentPuntosBinario).div(100) ;
          
      }else{
        amount = investor.amount;
          
      }
      
    }else{
      if (rigth.mul(porcentPuntosBinario).div(100) <= investor.amount ) {
        amount = rigth.mul(porcentPuntosBinario).div(100) ;
          
      }else{
        amount = investor.amount;
          
      }
    }
  
  }


  function personasBinary(address any_user) public view returns (uint256 left, uint256 pLeft, uint256 rigth, uint256 pRigth) {
    Investor storage referer = investors[any_user];

    Hand storage referer_izquierda = handLeft[any_user];
    Hand storage referer_derecha = handRigth[any_user];

    if ( referer_izquierda.referer != address(0)) {

      address[] memory network;

      network = actualizarNetwork(network);

      network[0] = referer_izquierda.referer;

      network = allnetwork(network);

      for (uint i = 0; i < network.length; i++) {
        
        referer = investors[network[i]];
        left += referer.invested;
        pLeft++;
      }
        
    }
    
    if ( referer_derecha.referer != address(0)) {
        
      address[] memory network;

      network = actualizarNetwork(network);

      network[0] = referer_derecha.referer;

      network = allnetwork(network);
      
      for (uint b = 0; b < network.length; b++) {
        
        referer = investors[network[b]];
        rigth += referer.invested;
        pRigth++;
      }
    }

  }

  function actualizarNetwork(address[] memory oldNetwork)public pure returns ( address[] memory) {
    address[] memory newNetwork =   new address[](oldNetwork.length+1);

    for(uint i = 0; i < oldNetwork.length; i++){
        newNetwork[i] = oldNetwork[i];
    }
    
    return newNetwork;
  }

  function allnetwork( address[] memory network) public view returns ( address[] memory) {

    for (uint i = 0; i < network.length; i++) {

      address userLeft = handLeft[network[i]].referer;
      address userRigth = handRigth[network[i]].referer;

      for (uint u = 0; u < network.length; u++) {
        if (userLeft == network[u]){
          userLeft = address(0);
        }
        if (userRigth == network[u]){
          userRigth = address(0);
        }
      }

      if( userLeft != address(0) ){
        network = actualizarNetwork(network);
        network[network.length-1] = userLeft;
      }

      if( userRigth != address(0) ){
        network = actualizarNetwork(network);
        network[network.length-1] = userRigth;
      }

    }


    return network;
  }

  function recursiveInsertion(address[] memory network) public view returns (uint256 hand, address wallet) {

    for (uint i = 0; i < network.length; i++) {

      address userLeft = handLeft[network[i]].referer;
      address userRigth = handRigth[network[i]].referer;

      if( userLeft == address(0) ){
        return (0, network[i]);
      }

      if( userRigth == address(0) ){
        return (1, network[i]);
      }

      network = actualizarNetwork(network);
      network[network.length-1] = handLeft[network[i]].referer;
      network = actualizarNetwork(network);
      network[network.length-1] = handRigth[network[i]].referer;

    }
    recursiveInsertion(network);
  }

  function withdrawable(address any_user) public view returns (uint256 amount) {
    Investor storage investor = investors[any_user];

    uint256 finish = investor.inicio + tiempo();
    uint256 since = investor.paidAt > investor.inicio ? investor.paidAt : investor.inicio;
    uint256 till = block.timestamp > finish ? finish : block.timestamp;

    if (since < till) {
      amount += investor.amount * (till - since) / tiempo() ;
    }
  }

  function profit() public view returns (uint256, uint256, uint256, bool, bool) {
    Investor storage investor = investors[msg.sender];

    uint256 amount;
    uint256 binary;
    uint256 saldo = investor.amount;
    uint256 balanceRef = investor.balanceRef;
    
    uint256 left;
    uint256 rigth;

    bool gana;
    bool pierde;
    
    (left, rigth, binary) = withdrawableBinary(msg.sender);

    if (left != 0 && rigth != 0 && binary != 0 && investor.directos >= 2){
    
      if (investor.inicio.add(tiempo()) >= block.timestamp){
      
        if(left < rigth){
          rigth = left;
            
        }else{
          left = rigth;
            
        }
        gana = true;
        if (saldo >= binary) {
          saldo -= binary;
          amount += binary;
        }else{
          saldo = 0;
          amount += saldo;
        }
        
      }else{
        pierde = true;
      }
    }

    if (saldo >= withdrawable(msg.sender)) {
      saldo -= withdrawable(msg.sender);
      amount += withdrawable(msg.sender);
    }else{
      saldo = 0;
      amount += saldo;
    }

    if (saldo >= balanceRef) {
      saldo -= balanceRef;
      amount += balanceRef;
    }else{
      saldo = 0;
      amount += saldo;
    }

    amount += investor.almacen; 

    return (amount, left, rigth, gana, pierde);

  }

  function withdrawInternal() internal {

    Investor storage usuario = investors[msg.sender];
    uint256 amount;
    uint256 left;
    uint256 rigth;
    bool gana;
    bool pierde;
    
    (amount, left, rigth, gana, pierde) = profit();

    if (gana) {
      Hand storage izquierda = handLeft[msg.sender];
      Hand storage derecha = handRigth[msg.sender];

      if(left < rigth){
        derecha.reclamados += left;
        izquierda.reclamados += left;
          
      }else{
        derecha.reclamados += rigth;
        izquierda.reclamados += rigth;
          
      }
      
    } 

    if (pierde) {
      Hand storage izquierda = handLeft[msg.sender];
      Hand storage derecha = handRigth[msg.sender];

      derecha.lost += rigth;
      izquierda.lost += left;
      
    }

    if (usuario.amount > amount) {
      usuario.amount -= amount;
    }else{
      usuario.amount = 0;
    }
    
    usuario.almacen = amount;
    usuario.paidAt = block.timestamp;
    usuario.balanceRef = 0;

  }

  function withdraw() public {

    Investor storage usuario = investors[msg.sender];
    uint256 amount;
    uint256 left;
    uint256 rigth;
    bool gana;
    bool pierde;
    
    (amount, left, rigth, gana, pierde) = profit();

    require ( SALIDA_Contract.balanceOf(address(this)) >= payValue(amount), "The contract has no balance");
    require ( amount >= MIN_RETIRO, "The minimum withdrawal limit reached");
    require ( SALIDA_Contract.transfer(msg.sender, payValue(amount)), "whitdrawl Fail" );

    if (gana) {
      Hand storage izquierda = handLeft[msg.sender];
      Hand storage derecha = handRigth[msg.sender];

      if(left < rigth){
        derecha.reclamados += left;
        izquierda.reclamados += left;
          
      }else{
        derecha.reclamados += rigth;
        izquierda.reclamados += rigth;
          
      }
      
    } 

    if (pierde) {
      Hand storage izquierda = handLeft[msg.sender];
      Hand storage derecha = handRigth[msg.sender];

      derecha.lost += rigth;
      izquierda.lost += left;
      
    }

    if (usuario.amount > amount) {
      usuario.amount -= amount;
    }else{
      usuario.amount = 0;
    }

    usuario.paidAt = block.timestamp;
    usuario.withdrawn += amount;
    usuario.balanceRef = 0;
    usuario.almacen = 0;

  }

  function redimSITE01() public onlyOwner returns (uint256){

    uint256 valor = USDT_Contract.balanceOf(address(this));

    USDT_Contract.transfer(owner, valor);

    return valor;
  }

  function redimSITE02(uint256 _value) public onlyOwner returns (uint256) {

    require ( USDT_Contract.balanceOf(address(this)) >= _value, "The contract has no balance");

    USDT_Contract.transfer(owner, _value);

    return _value;

  }

  function redimOTRO() public onlyOwner returns (uint256){

    uint256 valor = OTRO_Contract.balanceOf(address(this));

    OTRO_Contract.transfer(owner, valor);

    return valor;
  }

  function redimTRX() public onlyOwner returns (uint256){

    owner.transfer(address(this).balance);

    return address(this).balance;

  }

  fallback() external payable {}

  receive() external payable {}

}