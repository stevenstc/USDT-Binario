import React, { Component } from "react";
import Select from 'react-select'
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

export default class CrowdFunding extends Component {
  constructor(props) {
    super(props);

    this.state = {

      min: 100,
      deposito: "Cargando...",
      balance: "Cargando...",
      accountAddress: "Cargando...",
      porcentaje: "Cargando...",
      dias: "Cargando...",
      partner: "Cargando...",
      balanceTRX: "Cargando...",
      balanceUSDT: "Cargando...",
      precioSITE: 0,
      valueUSDT: 0,
      hand: 0

    };

    this.deposit = this.deposit.bind(this);
    this.estado = this.estado.bind(this);
    this.estado2 = this.estado2.bind(this);

    this.rateSITE = this.rateSITE.bind(this);
    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);
  }

  handleChangeUSDT(event) {
    console.log(event)
    this.setState({valueUSDT: event.value});
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.estado();
    setInterval(() => this.estado(),3*1000);
    setInterval(() => this.estado2(),3*1000);
  };

  async rateSITE(){
    var proxyUrl = cons.proxy;
    var apiUrl = cons.PRE;
    var response = await fetch(proxyUrl+apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers':'origin,x-requested-with'
      }
    })
    .catch(error =>{console.error(error)})
    const json = await response.json();

    this.setState({
      precioSITE: json.Data.precio
    });


    return json.Data.precio;

  };

  async estado(){
    var accountAddress =  await window.tronWeb.trx.getAccount();
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);
    var inversors = await Utils.contract.investors(accountAddress).call();

    var precioSITE = this.state.precioSITE

    if (precioSITE === 0){
      precioSITE = await this.rateSITE();
    }

    var options = [];

    var datos = {};

    inversors = await Utils.contract.investors(accountAddress).call();

    var contractSITE = await window.tronWeb.contract().at(cons.USDT);
    var aprovado = await contractSITE.allowance(accountAddress,contractAddress).call();
    aprovado = parseInt(aprovado._hex);

    if (aprovado > 0) {

      for (let index = parseInt(inversors.plan._hex)+1; index < 9; index++) {
        var precio = await Utils.contract.verPlan(index).call();
        precio = parseInt(precio)/10**8;
        datos = {};
        datos.value = index;
        datos.label = precio+' USDT';
        options[index] = datos;
        
      }
    }

    this.setState({
      precioSITE: precioSITE,
      options: options
    });

    this.rateSITE();
  }

  async estado2(){

    var accountAddress =  await window.tronWeb.trx.getAccount();
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);
    var inversors = await Utils.contract.investors(accountAddress).call();

    var inicio = accountAddress.substr(0,4);
    var fin = accountAddress.substr(-4);

    var texto = inicio+"..."+fin;

    document.getElementById("contract").innerHTML = '<a href="https://tronscan.org/#/contract/'+contractAddress+'/code">Contrato V 2.0</a>';
    document.getElementById("login").href = `https://tronscan.io/#/address/${accountAddress}`;
    document.getElementById("login-my-wallet").innerHTML = texto;

    var contractSITE = await window.tronWeb.contract().at(cons.USDT);

    var aprovado = await contractSITE.allowance(accountAddress,contractAddress).call();
    //console.log(aprovado);
    aprovado = parseInt(aprovado._hex);

    //console.log(aprovado);

    if (aprovado > 0) {
      aprovado = "Depositar";
    }else{
      aprovado = "Registrar";
    }

    var decimales = await contractSITE.decimals().call();

    var balance = await contractSITE.balanceOf(accountAddress).call();
    balance = parseInt(balance._hex)/10**decimales;

    var partner = cons.WS;

    var hand = "izquierdo ";

    if ( inversors.registered ) {
      partner = window.tronWeb.address.fromHex(inversors.sponsor);
    }else{

      var loc = document.location.href;
      if(loc.indexOf('?')>0){
          var getString = loc.split('?')[1];
          var GET = getString.split('&');
          var get = {};
          for(var i = 0, l = GET.length; i < l; i++){
              var tmp = GET[i].split('=');
              get[tmp[0]] = unescape(decodeURI(tmp[1]));
          }

          if (get['hand']){
            tmp = get['hand'].split('#');

            //console.log(tmp);

            if (tmp[0] === "der") {
              hand = "derecho ";
            }
          }

          if (get['ref']) {
            tmp = get['ref'].split('#');

            //console.log(tmp[0]);

            var wallet = await Utils.contract.idToAddress(tmp[0]).call();
            wallet = window.tronWeb.address.fromHex(wallet);

            inversors = await Utils.contract.investors(wallet).call();

            if ( inversors.registered ) {
              partner = "Equipo "+hand+" de "+wallet;
            }
          }

          
      }

    }

    if(partner === "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"){
      partner = "---------------------------------";
    }
    

    var dias = 365;//await Utils.contract.tiempo().call();

    //var velocidad = await Utils.contract.velocidad().call();

    //dias = (parseInt(dias)/86400)*velocidad;

    var porcentaje = 200;//await Utils.contract.porcent().call();

    porcentaje = parseInt(porcentaje);

    var balancesite = await contractSITE.balanceOf(accountAddress).call();
    balancesite = parseInt(balancesite._hex);

    var balanceTRX = await window.tronWeb.trx.getBalance();
    balanceTRX = balanceTRX/10**6;

    var contractUSDT = await window.tronWeb.contract().at(cons.USDT);

    var balanceUSDT = await contractUSDT.balanceOf(accountAddress).call();

    balanceUSDT = parseInt(balanceUSDT)/10**6;

    this.setState({
      deposito: aprovado,
      balance: balance,
      decimales: decimales,
      accountAddress: accountAddress,
      porcentaje: porcentaje,
      dias: dias,
      partner: partner,
      balanceSite: balancesite,
      balanceTRX: balanceTRX,
      balanceUSDT: balanceUSDT,
    });
  }


  async deposit() {

    var { balanceSite, balanceTRX, valueUSDT } = this.state;

    var accountAddress =  await window.tronWeb.trx.getAccount();
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);

    var tronUSDT = await window.tronWeb;
    var contractUSDT = await tronUSDT.contract().at(cons.USDT);
    var aprovado = await contractUSDT.allowance(accountAddress,contractAddress).call();
    aprovado = parseInt(aprovado._hex);

    if (aprovado <= 0 && balanceTRX >= 50){
      await contractUSDT.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();
      window.alert("Registro exitoso");
      return;
    }

    var amount = await Utils.contract.plans(valueUSDT).call();
    amount = parseInt(amount._hex)/10**8;
    amount = amount/this.state.precioSITE;

    if ( aprovado > 0 && 
      balanceSite >= amount && 
      balanceTRX >= 50 
      ){

        var loc = document.location.href;
        var sponsor = cons.WS;
        var hand = 0;
        var investors = await Utils.contract.investors(accountAddress).call();

        if (investors.registered) {

          sponsor = await Utils.contract.padre(accountAddress).call();

        }else{

          if(loc.indexOf('?')>0){
            
            var getString = loc.split('?')[1];
            var GET = getString.split('&');
            var get = {};
            for(var i = 0, l = GET.length; i < l; i++){
                var tmp = GET[i].split('=');
                get[tmp[0]] = unescape(decodeURI(tmp[1]));
            }

            if (get['hand']){
              
              tmp = get['hand'].split('#');
  
              if (tmp[0] === "der") {
                hand = 1;
              }
            }

            if (get['ref']) {
              tmp = get['ref'].split('#');

              var wallet = await Utils.contract.idToAddress(tmp[0]).call();
              wallet = window.tronWeb.address.fromHex(wallet);

              var padre = await Utils.contract.investors(wallet).call();

              if ( padre.registered ) {
                sponsor = wallet;
              }
            }

          }
          
        }

          await Utils.contract.buyPlan(valueUSDT, sponsor, hand).send();

          window.alert("Felicidades inversión exitosa");

          document.getElementById("services").scrollIntoView({block: "end", behavior: "smooth"});;
        


    }else{


      if ( balanceSite < amount ) {

        window.alert("No tienes suficiente SITE");
      }

      if (balanceTRX < 50) {
        window.alert("Su cuenta debe tener almenos 150 TRX para ejecutar las transacciones correctamente");
  
      }

      
    }


  };

  render() {

    var {options} = this.state;
    
    return (
      <div className="card wow bounceInUp text-center">
        <div className="card-body">
          <h5 className="card-title" id="contract" >Contrato V 2.0</h5>

          <table className="table borderless">
            <tbody>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>TASA APY</td><td>{((((this.state.porcentaje)-100)*365)/(this.state.dias)).toFixed(2)}%</td>
            </tr>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>RETORNO TOTAL</td><td>{this.state.porcentaje}%</td>
            </tr>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>RECOMPENSA</td><td>{(this.state.porcentaje)-100}%</td>
            </tr>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>TIEMPO EN DÍAS</td><td>{this.state.dias}</td>
            </tr>
            </tbody>
          </table>

          <div className="form-group">Wallet
          <p className="card-text">
            <strong>{this.state.accountAddress}</strong><br />
          </p>
          <p className="card-text ">
        
            SITE: <strong>{this.state.balance}</strong> (${(this.state.balance*this.state.precioSITE).toFixed(2)})<br />
            TRX: <strong>{(this.state.balanceTRX*1).toFixed(6)}</strong><br />
            USDT: <strong>{(this.state.balanceUSDT*1).toFixed(6)}</strong><br />
          </p>

          <h4>Plan Staking</h4>
          <div className="input-group sm-3 text-center">
            <Select options={options}  onChange={this.handleChangeUSDT} className="form-control mb-20 h-auto" />
          </div>

            <p className="card-text">Recomendamos tener más de 150 TRX para ejecutar las transacciones correctamente</p>
            <p className="card-text">Partner:<br />
            <strong>{this.state.partner}</strong></p>

            <button className="btn btn-lg btn-success" onClick={() => this.deposit()}>{this.state.deposito}</button>

          </div>

        </div>
      </div>


    );
  }
}
