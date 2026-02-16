
import React, { useState, useEffect, useMemo } from "react";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
  ThemeProvider,
  createTheme,
  CssBaseline,
  IconButton,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import "./App.css";

import { useNavigate, useLocation } from "react-router-dom";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState([34.80746, -40.4796]);
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
        },
      }),
    [darkMode]
  );


  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));

          const sortedData = sortData(data, casesType);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);

          // Check URL params after data load
          const params = new URLSearchParams(location.search);
          const countryParam = params.get('country');
          if (countryParam) {
            handleCountryChange(countryParam, true);
          }
        });
    };

    getCountriesData();
  }, []); // Run once on mount

  useEffect(() => {
    if (mapCountries.length > 0) {
      setTableData(sortData(mapCountries, casesType));
    }
  }, [casesType, mapCountries]);

  const handleCountryChange = async (countryCode, fromUrl = false) => {
    // Update URL if not triggered by URL itself
    if (!fromUrl) {
      if (countryCode === "worldwide") {
        navigate('/');
      } else {
        navigate(`?country=${countryCode}`);
      }
    }

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);

        if (countryCode === "worldwide") {
          setMapCenter([34.80746, -40.4796]);
          setMapZoom(3);
        } else {
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setMapZoom(5);
        }
      });
  };

  const onCountryChange = (event) => {
    const countryCode = event.target.value;
    handleCountryChange(countryCode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={`app ${darkMode ? "dark-mode" : ""}`}>
        <div className="app__left">
          <div className="app__header">
            <h1>COVID-19 TRACKER</h1>
            <div style={{ display: "flex", alignItems: "center" }}>
              <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
              <FormControl className="app__dropdown">
                <Select
                  variant="outlined"
                  onChange={onCountryChange}
                  value={country}
                >
                  <MenuItem value="worldwide">Worldwide</MenuItem>
                  {countries.map((country) => (
                    <MenuItem key={country.name} value={country.value}>{country.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="app__stats">
            <InfoBox
              isRed
              active={casesType === "cases"}
              onClick={() => setCasesType("cases")}
              title="Coronavirus Cases"
              cases={prettyPrintStat(countryInfo.todayCases)}
              total={prettyPrintStat(countryInfo.cases)}
            />
            <InfoBox
              active={casesType === "recovered"}
              onClick={() => setCasesType("recovered")}
              title="Recovered"
              cases={prettyPrintStat(countryInfo.todayRecovered)}
              total={prettyPrintStat(countryInfo.recovered)}
            />
            <InfoBox
              isRed
              active={casesType === "deaths"}
              onClick={() => setCasesType("deaths")}
              title="Deaths"
              cases={prettyPrintStat(countryInfo.todayDeaths)}
              total={prettyPrintStat(countryInfo.deaths)}
            />
          </div>

          <Map
            casesType={casesType}
            countries={mapCountries}
            center={mapCenter}
            zoom={mapZoom}
            darkMode={darkMode}
            selectedCountry={country}
          />
        </div>

        <Card className="app__right">
          <CardContent>
            <h3>Live {casesType.charAt(0).toUpperCase() + casesType.slice(1)} by Country</h3>
            <Table countries={tableData} onCountryClick={handleCountryChange} casesType={casesType} selectedCountry={country} />
            <h3 className="app__graphTitle">
              {countryInfo.country || 'Worldwide'} {casesType === 'recovered' ? 'Total' : 'new'} {casesType}
            </h3>
            <LineGraph className="app__graph" casesType={casesType} country={country} />
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
}

export default App;
