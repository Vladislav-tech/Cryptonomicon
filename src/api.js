const API_KEY = '7988483396dcdf51392e965e28d73a3071ac10bfb3c69d5ebb9d39c130ba8b2b';

const tickersHandlers = new Map();
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);


const AGGREGATE_INDEX  = "5";

socket.addEventListener('message', (evt) => {
    const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(evt.data);
    
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

function subscribeToTickerOnWs(ticker) {
    sendToWebSocket({
        "action": "SubAdd",
        "subs": [`5~CCCAGG~${ticker}~USD`],
    });
}

function UnSubscribeFromTickerOnWs(ticker) {
    sendToWebSocket({
        "action": "SubRemove",
        "subs": [`5~CCCAGG~${ticker}~USD`],
    });
}

function UnSubscribeFromTickersOnWs(tickers) {
    tickers.forEach(ticker => {
        sendToWebSocket({
            "action": "SubRemove",
            "subs": [`5~CCCAGG~${ticker.name}~USD`],
        });    
    });

}

export const subscribeToTicker = (ticker, callback) => {
    const subscribers = tickersHandlers.get(ticker) || [];
    tickersHandlers.set(ticker, [...subscribers, callback]);
    subscribeToTickerOnWs(ticker);
};

export const unSubscribeFromTicker = (ticker) => {
    tickersHandlers.delete(ticker);
    UnSubscribeFromTickerOnWs(ticker);
};

export const unSubscribeFromTickers = (tickers) => {
    tickersHandlers.clear();
    UnSubscribeFromTickersOnWs(tickers);
};

window.tickersHandlers = tickersHandlers;

export const getCoinsList = async (component) => {
    const f = await fetch(
        "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
    );
    component.coinsList = (await f.json()).Data;
};