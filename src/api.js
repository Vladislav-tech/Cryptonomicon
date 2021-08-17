const API_KEY =
  "7988483396dcdf51392e965e28d73a3071ac10bfb3c69d5ebb9d39c130ba8b2b";

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

// Index of cryptocompare
const AGGREGATE_INDEX = "5";

socket.addEventListener("message", evt => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    PARAMETER: parameter
  } = JSON.parse(evt.data);

  // If the coin doesn`t available on cryptocompare
  if (type === "500") {
    let name = tickersHandlers.get(parameter.split("~")[2]);
    let unavailableTickers = name ?? [];
    unavailableTickers.forEach(fn => fn(`Тикер ${name} временно недоступен`));
  }

  // If the price didn`t change
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }

  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach(fn => fn(newPrice));
});

/**
 *
 * @param {Object} message - object, which have action type and subs (coins)
 */

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message);

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMessage);
    },
    { once: true }
  );
}

/**
 *
 * @param {string} ticker = name of coin
 * @param {string} currency = currency of coin
 */

function subscribeToTickerOnWs(ticker, currency = "USD") {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~${currency}`]
  });
}

/**
 *
 * @param {string} ticker = name of coin
 * @param {string} currency = currency of coin
 */

function UnSubscribeFromTickerOnWs(ticker, currency = "USD") {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~${currency}`]
  });
}

/**
 *
 * @param {Array} ticker = array of objects, which everyone is coin
 * @param {string} currency = currency of coins
 */

function UnSubscribeFromTickersOnWs(tickers, currency = "USD") {
  tickers.forEach(ticker => {
    sendToWebSocket({
      action: "SubRemove",
      subs: [`5~CCCAGG~${ticker.name}~${currency}`]
    });
  });
}

/**
 *
 * @param {string} ticker = name of coin
 * @param {string} currency = currency of coin
 * @param {Object} callback = function of ticker
 */

export const subscribeToTicker = (ticker, currency, callback) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, callback]);
  subscribeToTickerOnWs(ticker, currency);
};

/**
 *
 * @param {string} ticker = name of coin
 * @param {string} currency = currency of coin
 */

export const unSubscribeFromTicker = (ticker, currency = "USD") => {
  tickersHandlers.delete(ticker);
  UnSubscribeFromTickerOnWs(ticker, currency);
};

/**
 *
 * @param {string} ticker = name of coin
 * @param {string} currency = currency of coin
 */

export const unSubscribeFromTickers = (tickers, currency = "USD") => {
  tickersHandlers.clear();
  UnSubscribeFromTickersOnWs(tickers, currency);
};

export const getCoinsList = () => {
  return fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  );
};
