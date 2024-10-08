import "./App.css";
import axios from "axios";
import { API_KEY, WEATHER_API_URL, WEATHER_ICON_URL } from "./Constant";
import { useEffect, useState } from "react";
import moment from "moment";
import { CircleLoader } from "react-spinners";

function App() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCelsius, setIsCelsius] = useState(true);

  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && search) {
      getWeatherData(search);
      setSearch("");
    }
  };

  const getWeatherData = async (city) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${WEATHER_API_URL}?q=${city}&appid=${API_KEY}&units=metric`
      );
      setLoading(false);
      setData(res.data);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getWeatherDataByCoords = async (latitude, longitude) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${WEATHER_API_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      setLoading(false);
      setData(res.data);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const getCurrentCity = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getWeatherDataByCoords(latitude, longitude);
        },
        (error) => {
          console.error(error);
          getWeatherData("Ahmedabad");
        }
      );
    } else {
      getWeatherData("Ahmedabad");
    }
  };

  useEffect(() => {
    getCurrentCity();
    // eslint-disable-next-line
  }, []);

  const getLocalTime = (timezoneOffset) => {
    const utcTime = new Date().getTime();
    const localTime = new Date(utcTime + timezoneOffset * 1000);
    return moment(localTime).format("MMM, DD YYYY - hh:mm:A");
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const convertTemperature = (temp) => {
    return isCelsius ? Math.round(temp) : Math.round((temp * 9) / 5 + 32);
  };

  const getTemperatureUnit = () => {
    return isCelsius ? "°C" : "°F";
  };

  const getWeatherIcon = (icon) => {
    return `${WEATHER_ICON_URL}/${icon}@2x.png`;
  };

  return (
    <div className="App">
      <div className="container">
        {loading ? (
          <p
            style={{
              display: "flex",
              margin: "auto",
              justifyContent: "center",
              padding: "auto",
            }}
          >
            <CircleLoader
              size={60}
              loading
              speedMultiplier={1.5}
              color={"#fff"}
              aria-label="Loading Spinner"
            />
          </p>
        ) : (
          <div className="weather__header">
            <form
              className="weather__search"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="text"
                placeholder="Search for a city..."
                className="weather__searchform"
                value={search}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
              />
              <i className="fa-solid fa-magnifying-glass"></i>
            </form>
            <div className="weather__units">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={!isCelsius}
                  onChange={toggleTemperatureUnit}
                />
                <span className="slider round"></span>
              </label>
              <span>{"°F"}</span>
            </div>
          </div>
        )}
        {data && (
          <>
            <div className="weather__body">
              <h1 className="weather__city">{data.name}</h1>
              <div className="weather__datetime">
                {getLocalTime(data.timezone)}
              </div>
              <div className="weather__forecast">
                {data.weather[0].description}
              </div>
              <div className="weather__icon">
                <img
                  src={getWeatherIcon(data.weather[0].icon)}
                  alt="weather icon"
                />
              </div>
              <p className="weather__temperature">
                {convertTemperature(data.main.temp)}
                {getTemperatureUnit()}
              </p>
              <div className="weather__minmax">
                <p>
                  Min: {convertTemperature(data.main.temp_min)}
                  {getTemperatureUnit()}
                </p>
                <p>
                  Max: {convertTemperature(data.main.temp_max)}
                  {getTemperatureUnit()}
                </p>
              </div>
            </div>

            <div className="weather__info">
              <div className="weather__card">
                <i className="fa-solid fa-temperature-full"></i>
                <div>
                  <p>Real Feel</p>
                  <p className="weather__realfeel">
                    {convertTemperature(data.main.feels_like)}
                    {getTemperatureUnit()}
                  </p>
                </div>
              </div>
              <div className="weather__card">
                <i className="fa-solid fa-droplet"></i>
                <div>
                  <p>Humidity</p>
                  <p className="weather__humidity">{data.main.humidity}%</p>
                </div>
              </div>
              <div className="weather__card">
                <i className="fa-solid fa-wind"></i>
                <div>
                  <p>Wind</p>
                  <p className="weather__wind">{data.wind.speed} m/s</p>
                </div>
              </div>
              <div className="weather__card">
                <i className="fa-solid fa-gauge-high"></i>
                <div>
                  <p>Pressure</p>
                  <p className="weather__pressure">
                    {data.main.pressure} hPa
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
