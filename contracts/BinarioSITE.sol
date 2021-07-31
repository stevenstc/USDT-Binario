pragma solidity >=0.7.0;
// SPDX-License-Identifier: Apache 2.0

import "./SafeMath.sol";
import "./InterfaseTRC20.sol";
import "./Ownable.sol";

contract SITEBinary is Ownable{
  using SafeMath for uint256;

  TRC20_Interface USDT_Contract;

  TRC20_Interface OTRO_Contract;

  struct Hand {
    uint256 reclamados;
    uint256 lost;
    address referer;
  }


  struct Investor {
    bool registered;
    bool recompensa;
    address sponsor;
    uint256 plan;
    uint256 balanceRef;
    uint256 totalRef;
    uint256 amount;
    uint256 inicio;
    uint256 invested;
    uint256 paidAt;
    uint256 withdrawn;
  }

  uint256 public MIN_RETIRO = 1*10**8;

  uint256 public rate = 1650000;

  uint256[5] public primervez = [30, 0, 0, 0, 0];

  uint256[5] public porcientos = [5, 0, 0, 0, 0];

  uint256[16] public plans = [0, 100*10**8, 300*10**8, 500*10**8, 1000*10**8, 10000*10**8,20000*10**8, 30000*10**8, 50000*10**8, 100000*10**8, 1000000*10**8, 2000000*10**8, 3000000*10**8, 5000000*10**8, 1000000000*10**8, 2000000000*10**8];

  uint256 public basePorcientos = 1000;

  bool public sisReferidos = true;
  bool public sisBinario = true;

  uint256 public dias = 1;
  uint256 public porcent = 200;

  uint256 public totalInvestors;
  uint256 public totalInvested;
  uint256 public totalRefRewards;


  mapping (address => Investor) public investors;
  mapping (address => Hand) public handLeft;
  mapping (address => Hand) public handRigth;
  mapping(uint256 => address) public idToAddress;
  mapping(address => uint256) public addressToId;
  
  uint256 public lastUserId = 2;


  constructor(address _tokenTRC20) {
    USDT_Contract = TRC20_Interface(_tokenTRC20);

    Investor storage usuario = investors[owner];

    ( usuario.registered, usuario.recompensa ) = (true,true);

    totalInvestors++;

    idToAddress[1] = msg.sender;
    addressToId[msg.sender] = 1;

  }

  function setRate(uint256 _rate) public onlyOwner {

    rate = _rate;

  }

  function setMIN_RETIRO(uint256 _min) public onlyOwner {

    MIN_RETIRO = _min*10**8;

  }

  function ChangeTokenUSDT(address _tokenTRC20) public onlyOwner returns (bool){

    USDT_Contract = TRC20_Interface(_tokenTRC20);

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
     return dias.mul(86400);
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

  function setPlans(uint256 _value, uint256 _level) public onlyOwner returns(uint256, uint256){
    plans[_level] = _value * 10**8;
    return (_value, _level);
  }


  function setTiempo(uint256 _dias) public onlyOwner returns(uint256){

    dias = _dias;
    
    return (_dias);

  }

  function setBase(uint256 _100) public onlyOwner returns(uint256){

    basePorcientos = _100;
    
    return (_100);

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

    res[0] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[1] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[2] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[3] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[4] = investors[yo].sponsor;
    yo = investors[yo].sponsor;

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

          usuario.amount -= a[i];

          usuario.balanceRef += a[i];
          usuario.totalRef += a[i];
          totalRefRewards += a[i];

        }else{
          break;
        }
      }
    }
  }

  function payValue(uint256 _value ) view public returns (uint256){
    return _value.mul(10**8).div(rate);
  }

  function buyPlan(uint256 _plan, address _sponsor, uint256 _hand) public {

    require( _hand <= 1, "mano incorrecta");
    require(_plan <= plans.length, "plan incorrecto");

    Investor storage usuario = investors[msg.sender];
    if( usuario.inicio != 0 && usuario.inicio.add(tiempo()) > block.timestamp){
      upGradePlan(_plan);
    }else{

      uint256 _value = plans[_plan];

      require( USDT_Contract.allowance(msg.sender, address(this)) >= payValue(_value), "aprovado insuficiente");
      require( USDT_Contract.transferFrom(msg.sender, address(this), payValue(_value)), "saldo insuficiente" );

      usuario.inicio = block.timestamp;

      usuario.invested += _value;
      usuario.amount += _value;
      usuario.plan = _plan;
      
      if (!usuario.registered){

        (usuario.registered, usuario.recompensa) = (true, true);
        usuario.sponsor = _sponsor;

        if (_sponsor != address(0) && sisBinario ){
          Hand storage izquierda = handLeft[_sponsor];
          Hand storage derecha = handRigth[_sponsor];
          if (_hand == 0){
              izquierda.referer = msg.sender;
          }else{
              derecha.referer = msg.sender;
          }
        }

        if (usuario.sponsor != address(0) && sisReferidos ){
          rewardReferers(msg.sender, _value, primervez);
        }
        
        totalInvestors++;

        idToAddress[lastUserId] = msg.sender;
        addressToId[msg.sender] = lastUserId;
        
        lastUserId++;

      }else{

        if (usuario.sponsor != address(0) && sisReferidos ){
          rewardReferers(msg.sender, _value, porcientos);
        }
      }

      totalInvested += _value;
    }
  }
  
  function upGradePlan(uint256 _plan) internal {

    Investor storage usuario = investors[msg.sender];
    require (_plan > usuario.plan, "tiene que se un plan mayor para hacer upgrade");

    uint256 _value = plans[_plan].sub(plans[usuario.plan]);

    require( USDT_Contract.allowance(msg.sender, address(this)) >= payValue(_value), "aprovado insuficiente");
    require( USDT_Contract.transferFrom(msg.sender, address(this), payValue(_value)), "saldo insuficiente" );
    
    usuario.plan = _plan;
    usuario.amount += _value;
    usuario.invested += _value;

     if (usuario.sponsor != address(0) && sisReferidos ){
       rewardReferers(msg.sender, _value, porcientos);
     }

    totalInvested += _value;
    
  }

  function withdrawable(address any_user) public view returns (uint256 amount) {
    Investor storage investor = investors[any_user];

    uint256 finish = investor.inicio + tiempo();
    uint256 since = investor.paidAt > investor.inicio ? investor.paidAt : investor.inicio;
    uint256 till = block.timestamp > finish ? finish : block.timestamp;

    if (since < till) {
      amount += investor.amount * (till - since) * porcent / tiempo() / 100;
    }
  }
  
  function withdrawableBinary(address any_user) public view returns (uint256 left, uint256 rigth, uint256 amount) {
    Investor storage referer = investors[any_user];

    Hand storage referer_izquierda = handLeft[any_user];
    Hand storage referer_derecha = handRigth[any_user];

    Investor storage investor = investors[any_user];

    Hand storage investor_izquierda = handLeft[referer_izquierda.referer];
    Hand storage investor_derecha = handRigth[referer_derecha.referer];

    if (investor_izquierda.referer != address(0) &&  investor_derecha.referer != address(0)) {
        
      while ( referer_izquierda.referer != address(0)) {
          
        referer = investors[referer_izquierda.referer];
        left += referer.invested;
          
      }
      
      left -= investor_izquierda.reclamados.add(investor_izquierda.lost);
      
      while ( referer_derecha.referer != address(0)) {
          
        referer = investors[referer_derecha.referer];
        rigth += referer.invested;
        referer_izquierda = handLeft[referer_izquierda.referer];
          
      }

      rigth -= investor_derecha.reclamados.add(investor_derecha.lost);

      if (left < rigth) {
        if (left.mul(10).div(100) <= investor.amount) {
          amount = left.mul(10).div(100) ;
            
        }else{
          amount = investor.amount;
            
        }
        
      }else{
        if (rigth.mul(10).div(100) <= investor.amount) {
          amount = rigth.mul(10).div(100) ;
            
        }else{
          amount = investor.amount;
            
        }
      }
    } 
  }

  function personasBinary(address any_user) public view returns (uint256 left, uint256 pLeft, uint256 rigth, uint256 pRigth) {
    Investor storage referer = investors[any_user];

    Hand storage referer_izquierda = handLeft[any_user];
    Hand storage referer_derecha = handRigth[any_user];

    Hand storage investor_izquierda = handLeft[any_user];
    Hand storage investor_derecha = handRigth[any_user];

    while ( referer_izquierda.referer != address(0)) {
      
      referer = investors[referer_izquierda.referer];
      left += referer.invested;
      referer_izquierda = handLeft[referer_izquierda.referer];
      pLeft++;
        
    }
      
    left -= investor_izquierda.reclamados.add(investor_izquierda.lost);
    
    while ( referer_derecha.referer != address(0)) {
        
      referer = investors[referer_derecha.referer];
      rigth += referer.invested;
      referer_derecha = handRigth[referer_derecha.referer];
      pRigth++;
    }

    rigth -= investor_derecha.reclamados.add(investor_derecha.lost);

  }

  function profit() internal returns (uint256) {
    Investor storage investor = investors[msg.sender];
    Hand storage izquierda = handLeft[msg.sender];
    Hand storage derecha = handRigth[msg.sender];

    uint256 amount = withdrawable(msg.sender);
    
    uint256 amountB;
    uint256 left;
    uint256 rigth;
    
    (left, rigth, amountB) = withdrawableBinary(msg.sender);

    if (left != 0 && rigth != 0){
    
      if (investor.inicio.add(tiempo()) >= block.timestamp){
      
        if(left < rigth){
          derecha.reclamados += left;
          izquierda.reclamados += left;
            
        }else{
          derecha.reclamados += rigth;
          izquierda.reclamados += rigth;
            
        }
        amount += amountB;
      }else{
          
        derecha.lost += rigth;
        izquierda.lost += left;
              
      }
    }

    amount += investor.balanceRef;
    investor.balanceRef = 0;

    investor.paidAt = block.timestamp;

    return amount;

  }


  function withdraw() external {

    Investor storage usuario = investors[msg.sender];

    uint256 amount = withdrawable(msg.sender)+usuario.balanceRef;

    uint256 _pay = amount.mul(10**8).div(rate);

    require ( USDT_Contract.balanceOf(address(this)) >= amount, "The contract has no balance");
    require ( amount >= MIN_RETIRO, "The minimum withdrawal limit reached");

    require ( USDT_Contract.transfer(msg.sender,_pay), "whitdrawl Fail" );

    profit();

    usuario.withdrawn += amount;

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