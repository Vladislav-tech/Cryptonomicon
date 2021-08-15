const API_KEY = '7988483396dcdf51392e965e28d73a3071ac10bfb3c69d5ebb9d39c130ba8b2b';

const tickersHandlers = new Map();

//TODO: refactor to use URLSearchParams
const loadTickers = () => {
    if (!tickersHandlers.size) {
        return;
    }
    console.log(tickersHandlers)

    fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
        ...tickersHandlers.keys()
    ].join(',')}&tsyms=USD&api_key=${API_KEY}`
    )
        .then(r => r.json())
        .then(rawData => {
                const updatedPrices = Object.fromEntries(
                    Object.entries(rawData).map(([key, value]) => [key, value.USD])
                );

                Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
                    const handlers = tickersHandlers.get(currency) ?? [];
                    handlers.forEach((fn) => fn(newPrice));
                });
                });
}

export const subscribeToTicker = (ticker, callback) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, callback]);
};

export const unSubscribeFromTicker = (ticker) => {
    tickersHandlers.delete(ticker);
};

export const unSubscribeFromTickers = () => tickersHandlers.clear();

setInterval(loadTickers, 3500);
window.tickersHandlers = tickersHandlers;

export const getCoinsList = async (component) => {
    const f = await fetch(
        "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    component.coinsList = (await f.json()).Data;
};