import React, { Component } from "react";
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
      maxButton:"Cargando...",
      precioSITE: 0

    };

    this.deposit = this.deposit.bind(this);
    this.estado = this.estado.bind(this);
    this.getMax = this.getMax.bind(this);

    this.rateSITE = this.rateSITE.bind(this);
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    await this.estado();
    setInterval(() => this.estado(),2*1000);
  };

  async rateSITE(){
    var proxyUrl = cons.proxy;
    var apiUrl = 'https://servicios-pesodigital.herokuapp.com/api/v1/servicio/precio/SITE';
    const response = await fetch(proxyUrl+apiUrl)
    .catch(error =>{console.error(error)})
    const json = await response.json();

    return json.Data.precio;

  };

  async estado(){

    var accountAddress =  await window.tronWeb.trx.getAccount();
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);

    var inicio = accountAddress.substr(0,4);
    var fin = accountAddress.substr(-4);

    var texto = inicio+"..."+fin;

    document.getElementById("contract").innerHTML = '<a href="https://tronscan.org/#/contract/'+contractAddress+'/code">Contrato V 1.0</a>';

    //document.getElementById("login").innerHTML = '<a href="https://tronscan.io/#/address/'+accountAddress+'" class="logibtn gradient-btn">'+texto+'</a>';
    document.getElementById("login").href = `https://tronscan.io/#/address/${accountAddress}`;
    document.getElementById("login-my-wallet").innerHTML = texto;

    var contractSITE = await window.tronWeb.contract().at(cons.USDT);

    var aprovado = await contractSITE.allowance(accountAddress,contractAddress).call();
    aprovado = parseInt(aprovado._hex);

    if (aprovado > 0) {
      aprovado = "Depositar";
    }else{
      document.getElementById("amount").value = "";
      aprovado = "Registrar";
    }

    var decimales = await contractSITE.decimals().call();

    var balance = await contractSITE.balanceOf(accountAddress).call();
    balance = parseInt(balance._hex)/10**decimales;

    var MIN_DEPOSIT = await Utils.contract.MIN_DEPOSIT().call();
    MIN_DEPOSIT = parseInt(MIN_DEPOSIT._hex)/10**decimales;

    var MAX_DEPOSIT = await Utils.contract.MAX_DEPOSIT().call();
    MAX_DEPOSIT = parseInt(MAX_DEPOSIT._hex)/10**decimales;

    var partner = cons.WS;

    var inversors = await Utils.contract.investors(accountAddress).call();

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

          if (get['ref']) {
            tmp = get['ref'].split('#');

            inversors = await Utils.contract.investors(tmp[0]).call();

            if ( inversors.registered ) {
              partner = tmp[0];
            }
          }
      }

    }

    if(partner === "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"){
      partner = "---------------------------------";
    }
    

    var dias = 185;//await Utils.contract.tiempo().call();

    //var velocidad = await Utils.contract.velocidad().call();

    //dias = (parseInt(dias)/86400)*velocidad;

    var porcentaje = 155;//await Utils.contract.porcent().call();

    porcentaje = parseInt(porcentaje);

    var balancesite = await contractSITE.balanceOf(accountAddress).call();
    balancesite = parseInt(balancesite._hex);

    var balanceTRX = await window.tronWeb.trx.getBalance();
    balanceTRX = balanceTRX/10**6;

    var contractUSDT = await window.tronWeb.contract().at("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");

    var balanceUSDT = await contractUSDT.balanceOf(accountAddress).call();

    balanceUSDT = parseInt(balanceUSDT)/10**6;

    var precioSITE = await this.rateSITE();

    this.setState({
      deposito: aprovado,
      balance: balance,
      decimales: decimales,
      accountAddress: accountAddress,
      porcentaje: porcentaje,
      dias: dias,
      min: MIN_DEPOSIT,
      max: MAX_DEPOSIT,
      partner: partner,
      balanceSite: balancesite,
      balanceTRX: balanceTRX,
      balanceUSDT: balanceUSDT,
      precioSITE: precioSITE,
      maxAlcanzado: parseInt(inversors.invested)/10**decimales <= MAX_DEPOSIT,
      maxButton:"Max"
    });
  }


  async deposit() {

    const {  deposito, decimales, balanceSite, balanceTRX, maxAlcanzado } = this.state;

    var { min, max } = this.state

    min = min*10**decimales;
    max = max*10**decimales;

    var amount = document.getElementById("amount").value;

    amount = parseFloat(amount);
    amount = parseInt(amount*10**decimales);

    //console.log(amount);

    //console.log(isNaN(amount));

    var accountAddress =  await window.tronWeb.trx.getAccount();
  
    accountAddress = window.tronWeb.address.fromHex(accountAddress.address);

    var tronUSDT = await window.tronWeb;
    var contractUSDT = await tronUSDT.contract().at(cons.USDT);

    if (deposito === "Registrar" && balanceTRX >= 50){
      document.getElementById("amount").value = "";
      await contractUSDT.approve(contractAddress, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send();
    }else{
      var aprovado = await contractUSDT.allowance(accountAddress, contractAddress).call();
      aprovado = parseInt(aprovado._hex);
    }

    if ( aprovado >= amount && 
      aprovado > 0 && 
      balanceSite >= amount && 
      amount >= min && 
      amount <= max && 
      balanceTRX >= 50 && 
      deposito !== "Registrar" &&
      maxAlcanzado
      ){


        
        var loc = document.location.href;
        var sponsor = cons.WS;

        var investors = await Utils.contract.investors(accountAddress).call();

        if (investors.registered) {

          sponsor = investors.sponsor;

        }else{

          if(loc.indexOf('?')>0){
            
            var getString = loc.split('?')[1];
            var GET = getString.split('&');
            var get = {};
            for(var i = 0, l = GET.length; i < l; i++){
                var tmp = GET[i].split('=');
                get[tmp[0]] = unescape(decodeURI(tmp[1]));
            }

            if (get['ref']) {
              tmp = get['ref'].split('#');

              var inversors = await Utils.contract.investors(tmp[0]).call();

              console.log(inversors);

              if ( inversors.registered ) {
                sponsor = tmp[0];
              }
            }

          }
          
        }

    
        if ( amount >= min ){

          await Utils.contract.deposit(amount, sponsor).send();

          document.getElementById("amount").value = "";

          window.alert("Felicidades inversión exitosa");

          document.getElementById("services").scrollIntoView({block: "end", behavior: "smooth"});;

        }


    }else{

      
      if ( amount < min ) {
        document.getElementById("amount").value = min/10**decimales;
        window.alert("coloca una cantidad mayor que "+(min/10**decimales)+" SITE");
      }

      if ( amount > max ) {
        document.getElementById("amount").value = "";
        window.alert("coloca una cantidad menor que "+(max/10**decimales)+" SITE");
      }

      if ( balanceSite < amount ) {
        document.getElementById("amount").value = "";
        window.alert("No tienes suficiente SITE");
      }

      if (!maxAlcanzado) {
        document.getElementById("amount").value = "";
        window.alert("Limite de deposito máximo alcanzado");
      }

      if (balanceTRX < 50) {
        await window.alert("Su cuenta debe tener almenos 150 TRX para ejecutar las transacciones correctamente");
  
      }

      
    }


  };

  getMax() {
    document.getElementById("amount").value = this.state.balance;
  }

  render() {

    var min = this.state.min;

    min = "Minimo. "+min+" SITE";



    return (
      <div className="card wow bounceInUp text-center">
        <div className="card-body">
          <h5 className="card-title" id="contract" >Contrato V 1.0</h5>

          <table className="table borderless">
            <tbody>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>TASA E.A</td><td>{((((this.state.porcentaje)-100)*365)/(this.state.dias)).toFixed(2)}%</td>
            </tr>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>RETORNO TOTAL</td><td>{this.state.porcentaje}%</td>
            </tr>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>RECOMPENSA</td><td>{(this.state.porcentaje)-100}%</td>
            </tr>
            <tr>
              <td><i className="fa fa-check-circle-o text-success"></i>Tiempo en días</td><td>{this.state.dias}</td>
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

          <div className="input-group mb-3">
            <input id="amount" type="number" className="form-control mb-20 text-center" placeholder={min}></input>
            <div className="input-group-append">
              <button className="btn btn-outline-secondary" type="button" onClick={this.getMax}>{this.state.maxButton}</button>
            </div>
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
