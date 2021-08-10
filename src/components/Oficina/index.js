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
      almacen: 0,
      withdrawn: 0,
      precioSITE: 0,
      valueSITE: 0,
      valueUSDT: 0,
      personasIzquierda: 0,
      puntosIzquierda: 0,
      personasDerecha: 0,
      puntosDerecha: 0,
      bonusBinario: 0,
      puntosEfectivosIzquierda: 0,
      puntosEfectivosDerecha: 0,
      puntosReclamadosIzquierda: 0,
      puntosReclamadosDerecha: 0,
      directos: 0,

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
    setInterval(() => this.Investors3(),3*1000);
    setInterval(() => this.Investors(),3*1000);
    setInterval(() => this.Link(),3*1000);
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
        loc = loc.split('?')[0];
      }

      if(loc.indexOf('#')>0){
        loc = loc.split('#')[0];
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
    let usuario = await Utils.contract.investors(direccion.address).call();
    usuario.withdrawable = await Utils.contract.withdrawable(direccion.address).call();
    
    var tronUSDT = await window.tronWeb;
    var direccioncontract = await Utils.contract.tokenPricipal().call();
    var contractUSDT = await tronUSDT.contract().at(direccioncontract); 
    var decimales = await contractUSDT.decimals().call();

    console.log(usuario);

    usuario.inicio = parseInt(usuario.inicio._hex)*1000;
    usuario.amount = parseInt(usuario.amount._hex);
    usuario.invested = parseInt(usuario.invested);
    usuario.withdrawn = parseInt(usuario.withdrawn._hex);
    usuario.directos = parseInt(usuario.directos);
    usuario.balanceRef = parseInt(usuario.balanceRef);
    usuario.almacen = parseInt(usuario.almacen);
    usuario.totalRef = parseInt(usuario.totalRef._hex);
    usuario.paidAt = parseInt(usuario.paidAt._hex);
    usuario.plan = parseInt(usuario.plan._hex);
    usuario.withdrawable = parseInt(usuario.withdrawable.amount._hex);

    console.log(usuario);

    var tiempo = await Utils.contract.tiempo().call();
    tiempo = parseInt(tiempo._hex)*1000;

    var porcentiempo = ((Date.now()-usuario.inicio)*100)/tiempo;

    let porcent = await Utils.contract.porcent().call();
    porcent = parseInt(porcent._hex)/100;
    var valorPlan = usuario.invested*porcent;

    var progresoUsdt = ((valorPlan-(usuario.invested*porcent-(usuario.withdrawn+usuario.withdrawable+usuario.balanceRef+usuario.almacen)))*100)/valorPlan;

    var progresoRetiro = ((valorPlan-(usuario.invested*porcent-usuario.withdrawn))*100)/valorPlan;

    var fecha = new Date(usuario.inicio+tiempo);
    fecha = ""+fecha;

    this.setState({
      direccion: window.tronWeb.address.fromHex(direccion.address),
      registered: usuario.registered,
      balanceRef: usuario.balanceRef/10**decimales,
      totalRef: usuario.totalRef/10**decimales,
      invested: usuario.invested/10**decimales,
      paidAt: usuario.paidAt/10**decimales,
      my: usuario.withdrawable/10**decimales,
      withdrawn: usuario.withdrawn/10**decimales,
      almacen: usuario.almacen/10**decimales,
      porcentiempo: porcentiempo,
      progresoUsdt: progresoUsdt,
      progresoRetiro: progresoRetiro,
      valorPlan: valorPlan/10**decimales,
      fecha: fecha,
      directos: usuario.directos
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

    //Personas y puntos totales
    let puntos = await Utils.contract.personasBinary(direccion.address).call();

    // monto de bonus y puntos efectivos
    let bonusBinario = await Utils.contract.withdrawableBinary(direccion.address).call();

    let brazoIzquierdo = await Utils.contract.handLeft(direccion.address).call();

    let brazoDerecho = await Utils.contract.handRigth(direccion.address).call();



    this.setState({
      personasIzquierda: parseInt(puntos.pLeft._hex),
      personasDerecha: parseInt(puntos.pRigth._hex),

      puntosIzquierda: parseInt(puntos.left._hex)/10**8,
      puntosDerecha: parseInt(puntos.rigth._hex)/10**8,

      bonusBinario: parseInt(bonusBinario.amount._hex)/10**8,

      puntosEfectivosIzquierda: parseInt(bonusBinario.left._hex)/10**8,
      puntosEfectivosDerecha: parseInt(bonusBinario.rigth._hex)/10**8,

      puntosReclamadosIzquierda: parseInt(brazoIzquierdo.reclamados._hex)/10**8,
      puntosReclamadosDerecha: parseInt(brazoDerecho.reclamados._hex)/10**8,

      puntosLostIzquierda: parseInt(brazoIzquierdo.lost._hex)/10**8,
      puntosLostDerecha: parseInt(brazoDerecho.lost._hex)/10**8,
    });

  };

  async withdraw(){
    const { balanceRef, my, almacen } = this.state;

    var available = (balanceRef+my+almacen);
    if(this.state.directos >= 2){
      available += this.state.bonusBinario;
    }
    available = available.toFixed(8);
    available = parseFloat(available);

    var direccioncontract = await Utils.contract.tokenPricipal().call();
    var contractUSDT = await window.tronWeb.contract().at(direccioncontract);

    var decimales = await contractUSDT.decimals().call();

    var MIN_RETIRO = await Utils.contract.MIN_RETIRO().call();
    MIN_RETIRO = parseInt(MIN_RETIRO._hex)/10**decimales;

    if ( available > MIN_RETIRO ){
      await Utils.contract.withdraw().send();
    }else{
      if (available < MIN_RETIRO) {
        window.alert("El minimo para retirar son: "+(MIN_RETIRO)+" USDT");
      }
    }
  };


  render() {
    var { balanceRef, invested, my, direccion, link, link2, almacen} = this.state;

    var available = balanceRef+my+almacen;
    if(this.state.directos >= 2){
      available += this.state.bonusBinario;
    }
    
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
          <h3 className="white">
            <i className="fa fa-user mr-2" aria-hidden="true"></i>
            <span style={{'fontWeight': 'bold'}}>
              Mi Oficina:
            </span>
          </h3>
          <div className="row text-center">
            <div className="col-md-12 col-lg-10 offset-lg-1 wow bounceInUp" data-wow-duration="1s">
              <div className="box">
                <h4 className="title"><a href={"https://tronscan.io/#/address/"+direccion} style={{"wordWrap": "break-word"}}>{direccion}</a></h4>
                Tiempo estimado de fin <b>{this.state.fecha}</b>
                <div className="progress" style={{"height": "20px"}}>
                  <div className="progress-bar-striped progress-bar-animated bg-success" role="progressbar" style={{"width": this.state.porcentiempo+"%"}} aria-valuenow={this.state.porcentiempo} aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <br></br>
                <b>{(this.state.withdrawn+available).toFixed(2)} USDT</b> ganancias de <b>{this.state.valorPlan} USDT</b>
                <div className="progress" style={{"height": "20px"}}>
                  <div className="progress-bar bg-info " role="progressbar" style={{"width": this.state.progresoUsdt+"%"}} aria-valuenow={this.state.progresoUsdt} aria-valuemin="0" aria-valuemax="100"></div>
                </div>
    
                <div className="progress" style={{"height": "20px"}}>
                  <div className="progress-bar bg-warning " role="progressbar" style={{"width": this.state.progresoRetiro+"%"}} aria-valuenow={this.state.progresoRetiro} aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                Reclamados <b>{(this.state.withdrawn).toFixed(2)} USDT</b>

                <br></br>
                <button type="button" className="btn btn-success d-block text-center mx-auto mt-1" onClick={() => document.getElementById("why-us").scrollIntoView({block: "end", behavior: "smooth"}) }>Upgrade Plan</button>


              </div>
            </div>

            <div className="col-md-5 offset-lg-1" >
              <h3 className="white" style={{'fontWeight': 'bold'}}><i className="fa fa-arrow-left mr-2" aria-hidden="true"></i>Mano izquierda</h3>
              <h6 className="white" style={{'padding': '1.5em', 'fontSize': '11px'}}><a href={link}>{link}</a> <br /><br />
              <CopyToClipboard text={link}>
                <button type="button" className="btn btn-info">COPIAR</button>
              </CopyToClipboard>
              </h6>
              <hr></hr>
            </div>

            <div className="col-md-5 " >
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
              <h4 className="title"><a href="#services">Disponible {this.state.puntosEfectivosIzquierda} pts</a></h4>
              <p className="description">Reclamado {this.state.puntosReclamadosIzquierda} pts</p>
              <hr />
              <p className="description">Total {this.state.puntosIzquierda} pts</p>


            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
              <p className="description">Equipo Derecho ({this.state.personasDerecha})</p>
              <h4 className="title"><a href="#services">Disponible {this.state.puntosEfectivosDerecha} pts</a></h4>
              <p className="description">Reclamado {this.state.puntosReclamadosDerecha} pts</p>
              <hr />
              <p className="description">Total {this.state.puntosDerecha} pts</p>

            </div>
          </div>

          <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-analytics-outline" style={{color: '#ff689b'}}></i></div>
              
              <h4 className="title"><a href="#services">Disponible {available} USDT</a></h4>
                
              <button type="button" className="btn btn-info d-block text-center mx-auto mt-1" onClick={() => this.withdraw()}>Retirar ~ {(available/this.state.precioSITE).toFixed(2)} SITE</button>
                 
              
              <hr></hr>
              <p className="description">Retirado <b>{(this.state.withdrawn).toFixed(2)} USDT</b> </p>
              <p className="description">Total invertido <b>{invested} USDT</b> </p>
            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-duration="1s">
            <div className="box">
              <div className="icon"><i className="ion-ios-analytics-outline" style={{color: '#ff689b'}}></i></div>
              <p className="description">Bonus </p>
              <h4 className="title"><a href="#services">{(this.state.balanceRef+this.state.bonusBinario).toFixed(2)} USDT</a></h4>
              <p>(~ {(this.state.balanceRef+this.state.bonusBinario/this.state.precioSITE).toFixed(2)} SITE)</p>
              <hr></hr>
              <p className="description">({this.state.directos}) Referidos directos <b>{(this.state.balanceRef).toFixed(2)} USDT</b> </p>
              <p className="description">({this.state.personasDerecha+this.state.personasIzquierda}) Red binaria <b>{(this.state.bonusBinario).toFixed(2)} USDT</b> </p>
              
            </div>
          </div>

        </div>

      </div>

    );
  }
}
