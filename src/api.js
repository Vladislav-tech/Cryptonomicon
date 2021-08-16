const API_KEY = '7988483396dcdf51392e965e28d73a3071ac10bfb3c69d5ebb9d39c130ba8b2b';

const tickersHandlers = new Map();
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);


const AGGREGATE_INDEX  = "5";

socket.addEventListener('message', (evt) => {
    const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice, PARAMETER: parameter} = JSON.parse(evt.data);
    
    if (type === '500') {
        let name = tickersHandlers.get(parameter.split('~')[2]);
        let unavailableTickers = name ?? [];
        unavailableTickers.forEach((fn) => fn(`Тикер ${name} временно недоступен`));
    }

    if (type !== AGGREGATE_INDEX || newPrice === undefined) {
        return;
    }

    const handlers = tickersHandlers.get(currency) ?? [];
    handlers.forEach((fn) => fn(newPrice));

});

function sendToWebSocket(message) {
    const stringifiedMessage = JSON.stringify(message);

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifiedMessage);
        return;
    }

    socket.addEventListener('open', () => {
        socket.send(stringifiedMessage);
    }, { once: true });

}

function subscribeToTickerOnWs(ticker, currency = 'USD') {
    sendToWebSocket({
        "action": "SubAdd",
        "subs": [`5~CCCAGG~${ticker}~${currency}`],
    });
}

function UnSubscribeFromTickerOnWs(ticker, currency = 'USD') {
    sendToWebSocket({
        "action": "SubRemove",
        "subs": [`5~CCCAGG~${ticker}~${currency}`],
    });
}

function UnSubscribeFromTickersOnWs(tickers, currency = 'USD') {
    tickers.forEach(ticker => {
        sendToWebSocket({
            "action": "SubRemove",
            "subs": [`5~CCCAGG~${ticker.name}~${currency}`],
        });    
    });

}

export const subscribeToTicker = (ticker, currency, callback) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, callback]);
    subscribeToTickerOnWs(ticker, currency);
};

export const unSubscribeFromTicker = (ticker, currency = 'USD') => {
    tickersHandlers.delete(ticker);
    UnSubscribeFromTickerOnWs(ticker, currency);
};

export const unSubscribeFromTickers = (tickers, currency = 'USD') => {
    tickersHandlers.clear();
    UnSubscribeFromTickersOnWs(tickers, currency);
};

window.tickersHandlers = tickersHandlers;

export const getCoinsList = async (component) => {
    const f = await fetch(
        "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    component.coinsList = (await f.json()).Data;
};