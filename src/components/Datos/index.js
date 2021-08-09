import React, { Component } from "react";
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

export default class Datos extends Component {
  constructor(props) {
    super(props);

    this.state = {
      totalInvestors: 0,
      totalInvested: 0,
      totalRefRewards: 0,
      precioSITE: 0,
    };

    this.totalInvestors = this.totalInvestors.bind(this);
    this.rateSITE = this.rateSITE.bind(this);
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    setInterval(() => this.totalInvestors(),3*1000);
  };

  async rateSITE(){
    var proxyUrl = cons.proxy;
    var apiUrl = cons.PRE;
    var response = await fetch(proxyUrl+apiUrl)
    .catch(error =>{console.error(error)})
    const json = await response.json();

    this.setState({
      precioSITE: json.Data.precio
    });

    return json.Data.precio;

  };

  async totalInvestors() {

    await this.rateSITE();

    let esto = await Utils.contract.setstate().call();

    var direccioncontract = await Utils.contract.tokenPago().call();
    var contractUSDT = await window.tronWeb.contract().at(direccioncontract);
    var decimales = await contractUSDT.decimals().call();
    //console.log(esto);
    this.setState({
      totalInvestors: parseInt(esto.Investors._hex)+31,
      totalInvested: parseInt(esto.Invested._hex)/10**decimales,
      totalRefRewards: parseInt(esto.RefRewards._hex)/10**decimales

    });

  };

  render() {
    const { totalInvestors, totalInvested, totalRefRewards } = this.state;


    return (
      <div className="row counters">

        <div className="col-lg-4 col-12 text-center">
          <span data-toggle="counter-up">{totalInvestors}</span>
          <p>Inversores Globales</p>
        </div>

        <div className="col-lg-4 col-12 text-center">
          <span data-toggle="counter-up">{(totalInvested/this.state.precioSITE).toFixed(2)} SITE</span>
          <p>Invertido en Plataforma</p>
        </div>

        <div className="col-lg-4 col-12 text-center">
          <span data-toggle="counter-up">{(totalRefRewards/this.state.precioSITE).toFixed(2)} SITE</span>
          <p>Total Recompensas por Referidos</p>
        </div>

      </div>
    );
  }
}
