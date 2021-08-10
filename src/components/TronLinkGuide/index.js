import React from 'react';

import TronLinkLogo from './TronLinkLogo.png';


const WEBSTORE_URL = 'https://chrome.google.com/webstore/detail/ibnejdfjmmkpcnlpebklmnkoeoihofec/';

const logo = (
    <div className='col-sm-4 text-center'>
        <img src={ TronLinkLogo } className="img-fluid" alt='TronLink logo' />
    </div>
);

const openTronLink = () => {
    window.open(WEBSTORE_URL, '_blank');
};

const TronLinkGuide = props => {
    const {
        installed = false
    } = props;

    if(!installed) {
        return (
            <div className='row' onClick={ openTronLink }>
                <div className='col-sm-8 bg-secondary text-white'>
                    <h1>Instalar TronLink</h1>
                    <p>
                        To create a post or tip others you must install TronLink. TronLink es una wallet de TRON que puede descargar en <a href={ WEBSTORE_URL } target='_blank' rel='noopener noreferrer'>Chrome Webstore</a>.
                        Una vez instalado, vuelva y refresque la pagina.
                    </p>
                </div>
                { logo }
            </div>
        );
    }

    return (
    <> <a href='/'>

        <div className='tronLink row' style={{'padding': '3em','color': 'black','textDecoration': 'none'}}>

            <div className='info col-sm-8 bg-secondary text-white'>
                <h1>Requiere Iniciar Sesión</h1>
                <p>
                    TronLink está instalado pero inicia sesion primero. Abre TronLink en la barra del nabegador y configura tu primer wallet o desbloquea una wallet ya creada.
                </p>
            </div>
            { logo }
        </div>
        </a>

    </>
    );
};

export default TronLinkGuide;
