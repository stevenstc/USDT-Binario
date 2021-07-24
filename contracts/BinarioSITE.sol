pragma solidity >=0.5.15;

import "./SafeMath.sol";
import "./InterfaseTRC20.sol";
import "./Ownable.sol";

contract SITEBinary is Ownable{
  using SafeMath for uint;

  TRC20_Interface USDT_Contract;

  TRC20_Interface OTRO_Contract;

  struct hand {
    uint reclamados;
    uint lost;
    address referer;
  }


  struct Investor {
    bool registered;
    bool recompensa;
    address sponsor;
    hand[] leftHand;
    hand[] rigthHand;
    uint plan;
    uint balanceRef;
    uint totalRef;
    uint amount;
    uint inicio;
    uint invested;
    uint paidAt;
    uint withdrawn;
  }

  uint public MIN_DEPOSIT = 100*10**8;
  uint public MAX_DEPOSIT = 11000*10**8;

  uint public MIN_RETIRO = 70*10**8;
  uint public MAX_RETIRO = 500000*10**8;

  uint[5] public primervez = [30, 0, 0, 0, 0];

  uint[5] public porcientos = [5, 0, 0, 0, 0];

  uint[15] public plans = [100*10**8, 300*10**8, 500*10**8, 1000*10**8, 10000*10**8,100*10**8, 300*10**8, 500*10**8, 1000*10**8, 10000*10**8,100*10**8, 300*10**8, 500*10**8, 1000*10**8, 10000*10**8];

  uint public basePorcientos = 1000;
  bool public sisReferidos = true;

  uint public dias = 1;
  uint public porcent = 200;

  uint public totalInvestors;
  uint public totalInvested;
  uint public totalRefRewards;


  mapping (address => Investor) public investors;

  constructor(address _tokenTRC20) public {
    USDT_Contract = TRC20_Interface(_tokenTRC20);

    Investor storage usuario = investors[owner];

    ( usuario.registered, usuario.recompensa ) = (true,true);
    usuario.sponsor = address(0);

    totalInvestors++;

  }

  function ChangeTokenUSDT(address _tokenTRC20) public onlyOwner returns (bool){

    USDT_Contract = TRC20_Interface(_tokenTRC20);

    return true;

  }

  function ChangeTokenOTRO(address _tokenTRC20) public onlyOwner returns (bool){

    OTRO_Contract = TRC20_Interface(_tokenTRC20);

    return true;

  }

  function setstate() public view  returns(uint Investors,uint Invested,uint RefRewards){
      return (totalInvestors, totalInvested, totalRefRewards);
  }

  function InContractSITE() public view returns (uint){
    return USDT_Contract.balanceOf(address(this));
  }

  function InContractOTRO() public view returns (uint){
    return OTRO_Contract.balanceOf(address(this));
  }

  function InContractTRX() public view returns (uint){
    return address(this).balance;
  }
  
  function tiempo() public view returns (uint){
     return dias.mul(86400);
  }

  function setPorcientos(uint _value_1, uint _value_2, uint _value_3, uint _value_4, uint _value_5) public onlyOwner returns(uint, uint, uint, uint, uint){

    porcientos = [_value_1, _value_2, _value_3, _value_4, _value_5];

    return (_value_1, _value_2, _value_3, _value_4, _value_5);

  }

  function setPrimeravezPorcientos(uint _value_1, uint _value_2, uint _value_3, uint _value_4, uint _value_5) public onlyOwner returns(uint, uint, uint, uint, uint){

    primervez = [_value_1, _value_2, _value_3, _value_4, _value_5];

    return (_value_1, _value_2, _value_3, _value_4, _value_5);

  }


  function setTiempo(uint _dias) public onlyOwner returns(uint){

    dias = _dias;
    
    return (_dias);

  }

  function setBase(uint _100) public onlyOwner returns(uint){

    basePorcientos = _100;
    
    return (_100);

  }

  function controlReferidos(bool _true_false) public onlyOwner returns(bool){

    sisReferidos = _true_false;
    
    return (_true_false);

  }

  function setRetorno(uint _porcentaje) public onlyOwner returns(uint){

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

  function rewardReferers(address yo, uint amount, uint[5] memory array) internal {

    address[5] memory referi = column(yo);
    uint[5] memory a;
    uint[5] memory b;

    for (uint i = 0; i < 5; i++) {

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

  function buyPlan(uint _plan, address _sponsor, uint _hand) public {

    Investor storage usuario = investors[msg.sender];
    require( usuario.inicio.add(tiempo()) <= block.timestamp, "no se ha terminado tu plan actual");

    uint _value = plans[_plan];

    require( USDT_Contract.allowance(msg.sender, address(this)) >= _value, "aprovado insuficiente");
    require( USDT_Contract.transferFrom(msg.sender, address(this), _value), "saldo insuficiente" );
    

    if (!usuario.registered){

      (usuario.registered, usuario.recompensa) = (true, true);
      usuario.sponsor = _sponsor;
      usuario.plan = _plan;
      if (_sponsor != address(0) && sisReferidos ){
        Investor storage usuario_Sponsor = investors[_sponsor];
        if (_hand == 0){
            usuario_Sponsor.leftHand[0].referer = msg.sender;
        }else{
            usuario_Sponsor.rigthHand[0].referer = msg.sender;
        }
        rewardReferers(msg.sender, _value, primervez);
      }
      
      totalInvestors++;

    }else{

      if (usuario.sponsor != address(0) && sisReferidos ){
        rewardReferers(msg.sender, _value, porcientos);
      }

    }

    usuario.inicio = block.timestamp;

    usuario.invested += _value;
    totalInvested += _value;
    usuario.amount += _value;

  }
  
  function upGradePlan(uint _plan) public {

    Investor storage usuario = investors[msg.sender];
    require (usuario.registered, "usuario no registrado");
    require (usuario.inicio.add(tiempo()) >= block.timestamp, "no se puede hacer upGrade a tu plan actual");
    require (_plan > usuario.plan);

    uint _value = plans[_plan].sub(plans[usuario.plan]);

    require( USDT_Contract.allowance(msg.sender, address(this)) >= _value, "aprovado insuficiente");
    require( USDT_Contract.transferFrom(msg.sender, address(this), _value), "saldo insuficiente" );
    

     if (usuario.sponsor != address(0) && sisReferidos ){
       rewardReferers(msg.sender, _value, porcientos);
     }


    usuario.invested += _value;
    totalInvested += _value;
    usuario.amount += _value;

  }


  function withdrawable(address any_user) public view returns (uint amount) {
    Investor storage investor = investors[any_user];

      uint finish = investor.inicio + tiempo();
      uint since = investor.paidAt > investor.inicio ? investor.paidAt : investor.inicio;
      uint till = block.timestamp > finish ? finish : block.timestamp;

      if (since < till) {
        amount += investor.amount * (till - since) * porcent / tiempo() / 100;
      }
    }
    
    function withdrawableBinary(address any_user) public view returns (uint left, uint rigth, uint amount) {
        Investor storage referer = investors[any_user];
        Investor storage investor = investors[any_user];
    
        
         while ( referer.leftHand[0].referer != address(0)) {
             
             referer = investors[referer.leftHand[0].referer];
             
             left += referer.invested;
             
             
         }
         
         left -= investor.leftHand[0].reclamados.add(investor.leftHand[0].lost);
         
         while ( referer.rigthHand[0].referer != address(0)) {
             
             referer = investors[referer.rigthHand[0].referer];
             
             rigth += referer.invested;
             
             
         }
    
        rigth -= investor.rigthHand[0].reclamados.add(investor.rigthHand[0].lost);
    
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


  function profit() internal returns (uint) {
    Investor storage investor = investors[msg.sender];

    uint amount = withdrawable(msg.sender);
    
    uint amountB;
    uint left;
    uint rigth;
    
    (left, rigth, amountB) = withdrawableBinary(msg.sender);
    
    if (investor.inicio.add(tiempo()) >= block.timestamp){
    
        if(left < rigth){
            investor.rigthHand[0].reclamados += left;
            investor.leftHand[0].reclamados += left;
            
        }else{
            investor.rigthHand[0].reclamados += rigth;
            investor.leftHand[0].reclamados += rigth;
            
        }
        amount += amountB;
    }else{
        
            investor.rigthHand[0].lost += rigth;
            investor.leftHand[0].lost += left;
            
    }

    amount += investor.balanceRef;
    investor.balanceRef = 0;

    investor.paidAt = block.timestamp;

    return amount;

  }


  function withdraw() external {

    Investor storage usuario = investors[msg.sender];

    uint amount = withdrawable(msg.sender)+usuario.balanceRef;

    require ( USDT_Contract.balanceOf(address(this)) >= amount, "The contract has no balance");
    require ( amount >= MIN_RETIRO, "The minimum withdrawal limit reached");
    require ( amount <= MAX_RETIRO, "The maximum withdrawal limit reached");
    require ( usuario.withdrawn+amount <= MAX_RETIRO, "The maximum withdrawal limit reached");

    require ( USDT_Contract.transfer(msg.sender,amount), "whitdrawl Fail" );

    profit();

    usuario.withdrawn += amount;

  }

  function redimSITE01() public returns (uint256){
    require(msg.sender == owner);

    uint256 valor = USDT_Contract.balanceOf(address(this));

    USDT_Contract.transfer(owner, valor);

    return valor;
  }

  function redimSITE02(uint _value) public returns (uint256) {

    require ( msg.sender == owner, "only owner");

    require ( USDT_Contract.balanceOf(address(this)) >= _value, "The contract has no balance");

    USDT_Contract.transfer(owner, _value);

    return _value;

  }

  function redimOTRO01() public onlyOwner returns (uint256){

    uint256 valor = OTRO_Contract.balanceOf(address(this));

    OTRO_Contract.transfer(owner, valor);

    return valor;
  }

  function redimOTRO02(uint _value) public onlyOwner returns (uint256){

    require ( OTRO_Contract.balanceOf(address(this)) >= _value, "The contract has no balance");

    OTRO_Contract.transfer(owner, _value);

    return _value;

  }

  function () external payable {}

}