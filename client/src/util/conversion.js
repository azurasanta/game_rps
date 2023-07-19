import React from 'react';
import InlineSVG from 'react-inlinesvg';

export const convertToCurrency = input => {
  let number = Number(input);
  if(!isNaN(number)){
    number = Math.floor(number * 100) / 100; // round down to 2 decimal places

    let [whole, decimal] = number.toFixed(2).toString().split('.');
    whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return <><InlineSVG src={`<svg id='busd' width="0.7em" height="0.7em" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 336.41 337.42"><defs><style>.cls-1{fill:#f0b90b;stroke:#f0b90b;}</style></defs><title>BUSD Icon</title><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><path class="cls-1" d="M168.2.71l41.5,42.5L105.2,147.71l-41.5-41.5Z"/><path class="cls-1" d="M231.2,63.71l41.5,42.5L105.2,273.71l-41.5-41.5Z"/><path class="cls-1" d="M42.2,126.71l41.5,42.5-41.5,41.5L.7,169.21Z"/><path class="cls-1" d="M294.2,126.71l41.5,42.5L168.2,336.71l-41.5-41.5Z"/></g></g></svg>`} /> {`${whole}.${decimal}`}</>;
  }else{
    return input;
  }
};
