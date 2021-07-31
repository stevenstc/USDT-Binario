import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

export default class Oficina extends Component {
  constructor(props) {
    super(props);

    this.state = {
      direccion: "",
      link: "Haz una inversión para obtener el LINK de referido",
      registered: false,
      balanceRef: 0,
      totalRef: 0,
      invested: 0,
      paidAt: 0,
      my: 0,
      withdrawn: 0,
      precioSITE: 0,
      valueSITE: 0,
      valueUSDT: 0,
      personasIzquierda: 0,
      puntosIzquierda: 0,
      personasDerecha: 0,
      puntosDerecha: 0

    };

    this.Investors = this.Investors.bind(this);
    this.Investors2 = this.Investors2.bind(this);
    this.Investors3 = this.Investors3.bind(this);
    this.Link = this.Link.bind(this);
    this.withdraw = this.withdraw.bind(this);

    this.rateSITE = this.rateSITE.bind(this);
    this.handleChangeSITE = this.handleChangeSITE.bind(this);
    this.handleChangeUSDT = this.handleChangeUSDT.bind(this);
  }

  handleChangeSITE(event) {
    this.setState({valueSITE: event.target.value});
  }

  handleChangeUSDT(event) {
    this.setState({valueUSDT: event.target.value});
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    setInterval(() => this.Investors2(),3*1000);
    setInterval(() => this.Investors3(),1*1000);
    setInterval(() => this.Investors(),1*1000);
    setInterval(() => this.Link(),1*1000);
  };

  async rateSITE(){
    var proxyUrl = cons.proxy;
    var apiUrl = cons.PRE;
    const response = await fetch(proxyUrl+apiUrl)
    .catch(error =>{console.error(error)})
    const json = await response.json();

    return json.Data.precio;

  };

  async Link() {
    const {registered} = this.state;
    if(registered){

      let loc = document.location.href;
      if(loc.indexOf('?')>0){
        loc = loc.split('?')[0]
      }
      let mydireccion = await window.tronWeb.trx.getAccount();
      mydireccion = window.tronWeb.address.fromHex(mydireccion.address)
      mydireccion = await Utils.contract.addressToId(mydireccion).call();
      mydireccion = loc+'?ref='+mydireccion;
      this.setState({
        link: mydireccion+"&hand=izq",
        link2: mydireccion+"&hand=der",
      });
    }else{
      this.setState({
        link: "Haz una inversión para obtener el LINK de referido",
        link2: "Haz una inversión para obtener el LINK de referido",
      });
    }
  }


  async Investors() {

    let direccion = await window.tronWeb.trx.getAccount();
    let esto = await Utils.contract.investors(direccion.address).call();
    let My = await Utils.contract.withdrawable(direccion.address).call();
    
    var tronUSDT = await window.tronWeb;
    var contractUSDT = await tronUSDT.contract().at(cons.USDT);
    var decimales = await contractUSDT.decimals().call();

    this.setState({
      direccion: window.tronWeb.address.fromHex(direccion.address),
      registered: esto.registered,
      balanceRef: parseInt(esto.balanceRef._hex)/10**decimales,
      totalRef: parseInt(esto.totalRef._hex)/10**decimales,
      invested: parseInt(esto.invested._hex)/10**decimales,
      paidAt: parseInt(esto.paidAt._hex)/10**decimales,
      my: parseInt(My.amount._hex)/10**decimales,
      withdrawn: parseInt(esto.withdrawn._hex)/10**decimales
    });

  };

  async Investors2() {

    var precioSITE = await this.rateSITE();

    this.setState({
      precioSITE: precioSITE
    });

  };

  async Investors3() {

    let direccion = await window.tronWeb.trx.getAccount();
    let puntos = await Utils.contract.personasBinary(direccion.address).call();

    //console.log(puntos);    

    this.setState({
      personasIzquierda: parseInt(puntos.pLeft._hex),
      puntosIzquierda: parseInt(puntos.left._hex)/10**8,
      personasDerecha: parseInt(puntos.pRigth._hex),
      puntosDerecha: parseInt(puntos.rigth._hex)/10**8


    });

  };

  async withdraw(){
    const { balanceRef, my } = this.state;

    var available = (balanceRef+my);
    available = available.toFixed(8);
    available = parseFloat(available);

    var tronUSDT = await window.tronWeb;
    var contractUSDT = await tronUSDT.contract().at(cons.USDT);

    var decimales = await contractUSDT.decimals().call();

    var MIN_RETIRO = await Utils.contract.MIN_RETIRO().call();
    MIN_RETIRO = parseInt(MIN_RETIRO._hex)/10**decimales;

    var MAX_RETIRO = await Utils.contract.MAX_RETIRO().call();
    MAX_RETIRO = parseInt(MAX_RETIRO._hex)/10**decimales;


    if ( available < MAX_RETIRO && available > MIN_RETIRO ){
      await Utils.contract.withdraw().send();
    }else{
      if (available > MAX_RETIRO) {
        window.alert("Por favor contacta con el soporte técnico de SITE");
      }
      if (available < MIN_RETIRO) {
        window.alert("El minimo para retirar son: "+(MIN_RETIRO)+" SITE");
      }
    }
  };


  render() {
    var { balanceRef, invested, my, direccion, link, link2} = this.state;

    var available = (balanceRef+my);
    available = available.toFixed(2);
    available = parseFloat(available);

    balanceRef = balanceRef.toFixed(2);
    balanceRef = parseFloat(balanceRef);

    invested = invested.toFixed(2);
    invested = parseFloat(invested);

    my = my.toFixed(2);
    my = parseFloat(my);

    return (

      <div className="container">

        <header style={{'textAlign': 'center'}} className="section-header">
          <h3 className="white"><i className="fa fa-user mr-2" aria-hidden="true"></i><span style={{'fontWeight': 'bold'}}>
          Mi Oficina:</span> <br></br>
          <span style={{'fontSize': '11px'}}>{direccion}</span></h3><br></br>
          <div className="row text-center">
            <div className="col-md-6" >
              <h3 className="white" style={{'fontWeight': 'bold'}}><i className="fa fa-arrow-left mr-2" aria-hidden="true"></i>Mano izquierda</h3>
              <h6 className="white" style={{'padding': '1.5em', 'fontSize': '11px'}}><a href={link}>{link}</a> <br /><br />
              <CopyToClipboard text={link}>
                <button type="button" className="btn btn-info">COPIAR</button>
              </CopyToClipboard>
              </h6>
              <hr></hr>
            </div>
            <div className="col-md-6" >
              <h3 className="white" style={{'fontWeight': 'bold'}}>Mano derecha <i className="fa fa-arrow-right mr-2" aria-hidden="true"></i></h3>
              <h6 className="white" style={{'padding': '1.5em', 'fontSize': '11px'}}><a href={link2}>{link2}</a> <br /><br />
              <CopyToClipboard text={link2}>
                <button type="button" className="btn btn-info">COPIAR</button>
              </CopyToClipboard>
              </h6>
              <hr></hr>
            </div>
          </div>

        </header>

        <div className="row text-center">
          <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
              <p className="description">Equipo Izquierdo ({this.state.personasIzquierda})</p>
              <h4 className="title"><a href="#services">{this.state.puntosIzquierda} puntos</a></h4>

            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
              <p className="description">Equipo Derecho ({this.state.personasDerecha})</p>
              <h4 className="title"><a href="#services"> {this.state.puntosDerecha} puntos</a></h4>

            </div>
          </div>

          <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-analytics-outline" style={{color: '#ff689b'}}></i></div>
              <h4 className="title"><a href="#services">{invested} USDT</a></h4> (~ {(this.state.invested/this.state.precioSITE).toFixed(2)} SITE)
              <p className="description">Total invertido</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-analytics-outline" style={{color: '#ff689b'}}></i></div>
              <h4 className="title"><a href="#services">{(this.state.balanceRef).toFixed(2)} USDT</a></h4> (~ {(this.state.balanceRef/this.state.precioSITE).toFixed(2)} SITE)
              <p className="description">Bonus de Red</p>
            </div>
          </div>

          <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-speedometer-outline" style={{color:'#41cf2e'}}></i></div>
              <h4 className="title"><a href="#services">Disponible</a></h4>
              <p className="description">{available} USDT</p> (~ {(available/this.state.precioSITE).toFixed(2)} SITE)
              <button type="button" className="btn btn-info d-block text-center mx-auto mt-1" onClick={() => this.withdraw()}>Retirar</button>
            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-speedometer-outline" style={{color:'#41cf2e'}}></i></div>
              <h4 className="title"><a href="#services">Retirado</a></h4>
              <p className="description">{(this.state.withdrawn).toFixed(2)} USDT</p> (~ {(this.state.withdrawn/this.state.precioSITE).toFixed(2)} SITE)
            </div>
          </div>

        </div>

      </div>

    );
  }
}
