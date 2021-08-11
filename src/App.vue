<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div class="container">
      <div class="w-full my-4"></div>
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="ticker"
                @keydown.enter="add('enter')"
                @input="showCoins"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
                autocomplete="off"
              />
            </div>
            <button
              type="button"
              v-for="(possibleCoin, index) in possibleCoins"
              :key="index"
              @click="add(possibleCoin)"
              tabindex="1"
              class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
            >
              {{ possibleCoin }}
            </button>
            <transition name="bounce">
              <div v-if="error" class="text-sm text-red-600">
                Такой тикер уже добавлен
              </div>
            </transition>
          </div>
        </div>
        <button
          @click="add('click')"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
        <transition-group tag="div" name="bounce">
          <template v-if="tickers.length">
            <button
              class="bg-blue-500 hover:bg-blue-400 text-white mr-2 font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
              v-for="currency in currencies"
              :key="currency"
              @click="switchCurrency(currency)"
            >
              {{ currency }}
            </button>
          </template>
        </transition-group>
      </section>

      <transition-group name="fade">
        <template v-if="tickers.length">
          <hr class="w-full border-t border-gray-600 my-4" />
          <p>
            Фильтры:
            <input
              v-model="filterName"
              type="text"
              placeholder="Имя"
              class="block border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            />
            <button
              v-if="page > 1"
              @click="page--"
              class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Назад
            </button>
            <button
              v-if="hasNextPage"
              @click="page++"
              class="my-4 mx-2 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Вперёд
            </button>
          </p>
          <p>
            Сортировка
            <select
              id="sortings"
              v-model="sorting"
              class="block border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            >
              >
              <option value="name A-Z">По названию</option>
              <option value="name Z-A">По названию (обратный порядок)</option>
              <option value="price ascending">Цена (возрастание)</option>
              <option value="price descending">Цена (убывание) </option>
            </select>
          </p>
          <button
            type="button"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="clearTickers"
          >
            Очистить
          </button>
          <hr class="w-full border-t border-gray-600 my-4" />
          <transition-group
            name="list"
            tag="dl"
            class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3"
          >
            <div
              v-for="t in paginatedTickers"
              :key="t.name"
              @click="select(t)"
              :class="{
                'border-4': selectedTicker === t
              }"
              class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
            >
              <div class="px-4 py-5 sm:p-6 text-center">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ t.name }} - {{ choosedCurrency }}
                </dt>
                <span class="flex items-center justify-center">
                  <img class="ticker-img" :src="t.image" />
                </span>
                <dd class="mt-1 text-2xl font-semibold text-green-600">
                  {{ numberWithSpaces(t.price) }}
                </dd>
              </div>
              <div class="w-full border-t border-gray-200"></div>
              <button
                @click.stop="handleDelete(t)"
                class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
              >
                <svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="#718096"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  ></path></svg
                >Удалить
              </button>
            </div>
          </transition-group>
          <hr class="w-full border-t border-gray-600 my-4" />
        </template>
      </transition-group>
      <section v-if="selectedTicker" class="relative">
        <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
          {{ selectedTicker.name }} - {{ choosedCurrency }}
        </h3>
        <div class="flex items-end border-gray-600 border-b border-l h-64">
          <div
            v-for="(bar, idx) in normalizedGraph"
            :key="idx"
            :style="{ height: `${bar}%` }"
            class="bg-purple-800 border w-10"
          ></div>
        </div>
        <button
          @click="selectedTicker = null"
          type="button"
          class="absolute top-0 right-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            xmlns:svgjs="http://svgjs.com/svgjs"
            version="1.1"
            width="30"
            height="30"
            x="0"
            y="0"
            viewBox="0 0 511.76 511.76"
            style="enable-background:new 0 0 512 512"
            xml:space="preserve"
          >
            <g>
              <path
                d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                fill="#718096"
                data-original="#000000"
              ></path>
            </g>
          </svg>
        </button>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",

  data() {
    return {
      ticker: "",
      currencies: ["USD", "RUB", "EUR", "JPY"],
      tickers: [],
      selectedTicker: null,
      graph: [],
      coinsList: [],
      possibleCoins: [],
      error: false,
      page: 1,
      image: "",
      sorting: "",
      choosedCurrency: "USD",
      filterName: "",
      filterPrice: {
        max: 0,
        min: 0
      }
    };
  },

  created() {
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );

    if (windowData.filter) {
      this.filterName = windowData.filter;
    }

    if (windowData.page) {
      this.page = windowData.page;
    }

    const tickersData = localStorage.getItem("tickers");

    if (tickersData) {
      this.tickers = JSON.parse(tickersData);
      this.tickers.forEach(ticker => {
        this.updateTickerPrices(ticker.name);
      });
    }
  },

  watch: {
    filterName() {
      this.page = 1;
    },

    pageStateOptions(value) {
      const { pathname } = window.location;
      window.history.pushState(
        null,
        document.title,
        `${pathname}?filter=${value.filterName}&page=${value.page}`
      );
    },

    sorting() {
      switch (this.sorting) {
        case "name A-Z":
          this.tickers = this.tickers.sort((a, b) => {
            if (a.name > b.name) {
              return 1;
            }
            if (a.name < b.name) {
              return -1;
            }
            if (a.name === b.name) {
              return 0;
            }
          });
          break;
        case "name Z-A":
          this.tickers = this.tickers.sort((a, b) => {
            if (a.name > b.name) {
              return -1;
            }
            if (a.name < b.name) {
              return 1;
            }
            if (a.name === b.name) {
              return 0;
            }
          });
          break;
        case "price ascending":
          this.tickers = this.tickers.sort((a, b) => a.price - b.price);
          break;
        case "price descending":
          this.tickers = this.tickers.sort((a, b) => b.price - a.price);
      }

      localStorage.setItem("tickers", JSON.stringify(this.filteredTickers));
      this.page = 1;
    },

    error() {
      setTimeout(() => (this.error = false), 3500);
    },

    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    selectedTicker() {
      this.graph = [];
    },

    tickers() {
      localStorage.setItem("tickers", JSON.stringify(this.tickers));
    }
  },

  methods: {
    add(value) {
      value === "click" || value === "enter" ? (value = this.ticker) : "";

      if (this.canAddTicker(value)) {
        const currentTicker = {
          name: value || this.ticker,
          price: "-",
          image: "",
          currency: this.choosedCurrency
        };

        this.tickers = [...this.tickers, currentTicker];

        this.updateTickerPrices(currentTicker.name);
        this.filterName = "";
      }
    },

    clearTickers() {
      this.tickers = [];
      localStorage.clear();
    },

    switchCurrency(newCurrency) {
      this.choosedCurrency = newCurrency;
    },

    updateTickerPrices(tickerName) {
      setInterval(async () => {
        try {
          const f = await fetch(
            `https://min-api.cryptocompare.com/data/price?fsym=${tickerName}&tsyms=USD,JPY,EUR,RUB&api_key=7988483396dcdf51392e965e28d73a3071ac10bfb3c69d5ebb9d39c130ba8b2b`
          );
          const data = await f.json();

          const tickerToUpdate = this.tickers.find(t => t.name === tickerName);
          if (tickerToUpdate) {
            tickerToUpdate.price =
              data[`${this.choosedCurrency}`] > 1
                ? +data[`${this.choosedCurrency}`].toFixed(2)
                : +data[`${this.choosedCurrency}`].toPrecision(2);
            tickerToUpdate.image =
              "https://www.cryptocompare.com" +
              this.coinsList[`${tickerName}`].ImageUrl;
          }

          if (this.selectedTicker?.name === tickerName) {
            this.graph.push(data.USD);
          }
        } catch (e) {
          console.log(e);
        }
      }, 3500);
      this.ticker = "";
    },

    select(ticker) {
      this.selectedTicker = ticker;
    },

    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter(t => t !== tickerToRemove);
      if (this.selectedTicker === tickerToRemove) {
        this.selectedTicker = null;
      }
      localStorage.setItem("tickers", JSON.stringify(this.tickers));
    },

    shuffleArray(array) {
      let currentIndex = array.length,
        randomIndex;

      while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex],
          array[currentIndex]
        ];
      }

      return array;
    },

    numberWithSpaces(x) {
      const parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return parts.join(".");
    },

    showCoins(event) {
      const value = event.target.value.toUpperCase();
      this.ticker = this.ticker.toUpperCase().trim();

      this.possibleCoins = Object.keys(this.coinsList).filter(item =>
        item.includes(value)
      );
      this.shuffleArray(this.possibleCoins);
      this.possibleCoins = this.possibleCoins.slice(0, 4);
    },

    async getCoinsList() {
      const f = await fetch(
        "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
      );
      this.coinsList = (await f.json()).Data;
    },

    canAddTicker(value) {
      if (this.tickers.length) {
        this.error = this.tickers.some(item => item.name === value);
        return this.tickers.every(item => item.name !== value);
      } else {
        return true;
      }
    }
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 6;
    },

    endIndex() {
      return this.page * 6;
    },

    filteredTickers() {
      return this.tickers.filter(ticker =>
        ticker.name.includes(this.filterName)
      );
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    normalizedGraph() {
      const maxValue = Math.max(...this.graph);
      const minValue = Math.min(...this.graph);
      return this.graph.map(
        price => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    },

    pageStateOptions() {
      return {
        filterName: this.filterName,
        page: this.page
      };
    }
  },

  mounted() {
    this.getCoinsList();
  }
};
</script>

<style src="./app.css"></style>
