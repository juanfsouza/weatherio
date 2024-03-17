"use client"s

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Lottie from 'react-lottie';
import sunAnimation from '../../public/Asol.json';
import nightAnimation from '../../public/Anoite.json';
import sunrainAnimation from '../../public/Asol_chuva.json';
import cloudyAnimation from '../../public/Anublado.json';
import fogAnimation from '../../public/Anevoeiro.json';
import stormAnimation from '../../public/Atempestade.json';
import snowingAnimation from '../../public/Anevando.json';
import logo from '../../public/logo.png';
import Image from 'next/image';

interface WeatherInfo {
  time: string;
  temperature: number;
  weatherDescription: string;
}

const Page = () => {
  const [city, setCity] = useState<string>('London');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<WeatherInfo[]>([]);
  const [showWeather, setShowWeather] = useState<boolean>(false);
  const [showButton, setShowButton] = useState<boolean>(true);
  const [daytime, setDaytime] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    if (weatherData && weatherData.sys) {
      const now = new Date().getTime() / 1000;
      if (now > weatherData.sys.sunrise && now < weatherData.sys.sunset) {
        setDaytime(true);
      } else {
        setDaytime(false);
      }
    }
  }, [weatherData]);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        if (!city.trim()) {
          throw new Error('Please enter a city name.');
        }

        setLoading(true);
        setError(null);

        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
        const response = await axios.get(apiUrl, { timeout: 5000 });
        setWeatherData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        if (error.response && error.response.status === 404) {
        } else {
          setError('Error fetching weather data. Please try again later.');
        }
        setLoading(false);
      }
    };

    if (showWeather) {
      fetchWeatherData();
    }
  }, [city, showWeather]);

  useEffect(() => {
    const fetchForecastData = async () => {
      if (!weatherData || !weatherData.coord) return;
      const { lon, lat } = weatherData.coord;
      const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}`;
      const response = await axios.get(apiUrl);
      const forecastList = response.data.list;
      const filteredForecast = forecastList.filter((forecast: any, index: number) => index % 8 === 0);
      setForecastData(
        filteredForecast.map((forecast: any) => ({
          time: forecast.dt_txt,
          temperature: forecast.main.temp,
          weatherDescription: forecast.weather[0].description.toLowerCase(),
        }))
      );
    };

    if (showWeather && weatherData) {
      fetchForecastData();
    }
  }, [weatherData, showWeather]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value);
  };

  const handleSearch = () => {
    setShowWeather(true);
    setShowButton(false);
  };

  const renderWeatherIcon = (weatherDescription: string) => {
    let animationData;

    if (weatherDescription.includes('storm')) {
      animationData = stormAnimation;
    } else if (weatherDescription.includes('fog')) {
      animationData = fogAnimation;
    } else if (weatherDescription.includes('snow')) {
      animationData = snowingAnimation;
    } else if (weatherDescription.includes('sun') || weatherDescription.includes('clear')) {
      animationData = sunAnimation;
    } else if (weatherDescription.includes('cloud')) {
      animationData = cloudyAnimation;
    } else if (weatherDescription.includes('rain')) {
      animationData = sunrainAnimation;
    } else {
      animationData = nightAnimation;
    }

    return (
      <Lottie
        options={{
          animationData: animationData,
          loop: true,
          autoplay: true,
        }}
        height={50}
        width={50}
      />
    );
  };

  return (
    <div className={daytime ? 'daytime-bg' : 'nighttime-bg'}>
      {/* Logo at the top */}
      <div className="flex justify-center items-center m-5 mb-5">
        <Image src={logo} alt="Logo" width={200} height={50} />
      </div>
      <div className="flex">
        <div className="min-h-screen flex-1 m-5 items-center">
          <div className="max-w-md w-full p-6 bg-zinc-800/20 rounded-md shadow-md">
            <input type="text" value={city} onChange={handleCityChange} className="w-full px-4 py-2 mb-4 rounded-md border border-slate-600 bg-zinc-800/50" />
            {showButton && (
              <button onClick={handleSearch} className="w-full px-4 py-2 bg-blue-500 text-white rounded-md">
                Search
              </button>
            )}
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {showWeather && weatherData && (
              <div>
                <h1 className="text-xl font-bold mb-2 my-3">Weather in {weatherData.name} now</h1>
                <div>
                  <p className="text-md font-bold">Temperature: {weatherData.main.temp}°C</p>
                  <p className="text-md font-bold">Condition: {weatherData.weather[0].description}</p>
                  <p className="text-md font-bold">Humidity: {weatherData.main.humidity}%</p>
                </div>
                <div className="mt-4">{renderWeatherIcon(weatherData.weather[0].description.toLowerCase())}</div>
              </div>
            )}
          </div>
          {showWeather && forecastData.length > 0 && (
            <div className="bg-zinc-800/20 max-w-md w-full p-6 rounded-md shadow-md mt-4">
              <h2 className="text-xl font-bold mb-5">Weather Forecast</h2>
              <div className="flex flex-col">
                {forecastData.map((data, index) => (
                  <div key={index} className="w-full flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="mr-4">{renderWeatherIcon(data.weatherDescription)}</div>
                      <p>{Math.floor(data.temperature)}°</p>
                    </div>
                    <div>
                      <p>{new Date(data.time).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                    </div>
                    <div>
                        <p>{new Date(data.time).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="time-container">
          <p>{currentTime}</p>
        </div>
      </div>
      {/* Se for noite, adicione as estrelas ou pontos piscando */}
      {!daytime && (
        <div>
          {/* Adicione quantas estrelas ou pontos piscando você quiser */}
          {/* Por exemplo, aqui adicionamos 100 estrelas ou pontos */}
          {[...Array(100)].map((_, index) => (
            <div
              key={index}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
