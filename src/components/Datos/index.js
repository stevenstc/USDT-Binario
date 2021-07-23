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
      totalRefRewards: 0
    };

    this.totalInvestors = this.totalInvestors.bind(this);
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    setInterval(() => this.totalInvestors(),1*1000);
  };

  async totalInvestors() {

    let esto = await Utils.contract.setstate().call();

    var tronUSDT = await window.tronWeb;
    var contractUSDT = await tronUSDT.contract().at(cons.USDT);
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
          <span data-toggle="counter-up">{totalInvested.toFixed(2)} SITE</span>
          <p>Invertido en Plataforma</p>
        </div>

        <div className="col-lg-4 col-12 text-center">
          <span data-toggle="counter-up">{totalRefRewards.toFixed(2)} SITE</span>
          <p>Total Recompensas por Referidos</p>
        </div>

      </div>
    );
  }
}
