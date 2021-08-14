const API_KEY = '7988483396dcdf51392e965e28d73a3071ac10bfb3c69d5ebb9d39c130ba8b2b';

//TODO: refactor to use URLSearchParams
export const loadTicker = (tickerName) => {
    return fetch(
        `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD,JPY,EUR,RUB&api_key=${API_KEY}`
    ).then(r => r.json());
};


export const getCoinsList = async (component) => {
    const f = await fetch(
        "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    component.coinsList = (await f.json()).Data;
};