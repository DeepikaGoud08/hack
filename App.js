import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Coin from './Coin';
import './App.css';

function App() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);
  const [recognizedSpeech, setRecognizedSpeech] = useState('');
  const [selectedCoinIndex, setSelectedCoinIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    axios
      .get(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
      )
      .then((res) => {
        setCoins(res.data);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleChange = (e) => {
    setSearch(e.target.value);
    setSelectedCoinIndex(-1); // Reset selected index on input change
  };

  const handleVoiceSearch = () => {
    setVoiceSearchActive(true);

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setRecognizedSpeech(transcript);

      if (transcript.toLowerCase() === 'clear') {
        setSearch('');
      } else {
        setSearch(transcript);
      }
    };

    recognition.onend = () => {
      setVoiceSearchActive(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    recognition.start();
  };

  const clearSearch = () => {
    setSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (filteredCoins.length === 0) return;

    const lastIndex = filteredCoins.length - 1;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedCoinIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : lastIndex));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedCoinIndex((prevIndex) => (prevIndex < lastIndex ? prevIndex + 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        announceSelectedCoin(filteredCoins[selectedCoinIndex]);
        break;
      default:
        break;
    }
  };

  const announceSelectedCoin = (selectedCoin) => {
    const liveRegion = document.getElementById('liveRegion');

    if (liveRegion) {
      liveRegion.textContent = `${selectedCoin.name}, Price: $${selectedCoin.current_price}, Symbol: ${selectedCoin.symbol}, Market Cap: $${selectedCoin.total_volume}`;
    }
  };

  const clearLiveRegion = () => {
    const liveRegion = document.getElementById('liveRegion');

    if (liveRegion) {
      liveRegion.textContent = '';
    }
  };

  const filteredCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='coin-app'>
      <header>
        <h1 className='coin-text'>Top 10 Currency Trends</h1>
      </header>
      <div className='coin-search'>
        <form>
          <label htmlFor='searchInput' className='sr-only'>
            Search
          </label>
          <input
            id='searchInput'
            className='coin-input'
            type='text'
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder='Search'
            value={search}
            ref={inputRef}
          />
          <button
            type='button'
            className={`voice-search-button ${voiceSearchActive ? 'active' : ''}`}
            onClick={handleVoiceSearch}
            disabled={voiceSearchActive}
          >
            🎤
          </button>
          <button
            type='button'
            className='clear-search-button'
            onClick={() => {
              clearSearch();
              clearLiveRegion();
            }}
          >
            Clear
          </button>
        </form>
        {recognizedSpeech && <p>Recognized speech: {recognizedSpeech}</p>}
      </div>
      <main>
        <div
          id='liveRegion'
          role='status'
          aria-live='assertive'
          className='sr-only'
        >
          {/* ARIA live region to announce selected coin information */}
        </div>
        {filteredCoins.map((coin, index) => (
          <Coin
            key={coin.id}
            name={coin.name}
            price={coin.current_price}
            symbol={coin.symbol}
            marketcap={coin.total_volume}
            volume={coin.market_cap}
            image={coin.image}
            priceChange={coin.price_change_percentage_24h}
            isSelected={index === selectedCoinIndex}
            onClick={() => {
              announceSelectedCoin(coin);
              clearLiveRegion(); // Clear live region after announcing
            }}
          />
        ))}
      </main>
    </div>
  );
}

export default App;
