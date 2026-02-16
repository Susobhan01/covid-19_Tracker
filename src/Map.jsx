
import React, { useEffect, useRef } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import numeral from 'numeral';
import "leaflet/dist/leaflet.css";
import "./Map.css";


// Fix for default marker icon in Leaflet + React


const casesTypeColors = {
    cases: {
        hex: "#CC1034",
        rgb: "rgb(204, 16, 52)",
        half_op: "rgba(204, 16, 52, 0.5)",
        multiplier: 400,
    },
    recovered: {
        hex: "#7dd71d",
        rgb: "rgb(125, 215, 29)",
        half_op: "rgba(125, 215, 29, 0.5)",
        multiplier: 500,
    },
    deaths: {
        hex: "#fb4443",
        rgb: "rgb(251, 68, 67)",
        half_op: "rgba(251, 68, 67, 0.5)",
        multiplier: 1200,
    },
};

function ChangeMapCenter({ center, zoom }) {
    const map = useMap();
    map.flyTo(center, zoom);
    return null;
}

function Map({ countries, casesType, center, zoom, darkMode, selectedCountry }) {
    // Leaflet expects [lat, lng] array, but our state might be {lat, lng} from Google Maps attempt
    const mapCenter = (!Array.isArray(center) && center.lat && center.lng) ? [center.lat, center.lng] : (Array.isArray(center) && center.length === 2 ? center : [34.80746, -40.4796]);

    const circleRefs = useRef({});

    useEffect(() => {
        if (selectedCountry && circleRefs.current[selectedCountry]) {
            circleRefs.current[selectedCountry].openPopup();
        }
    }, [selectedCountry, casesType]);

    const tileUrl = darkMode
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    return (
        <div className="map">
            <LeafletMap center={mapCenter} zoom={zoom}>
                <ChangeMapCenter center={mapCenter} zoom={zoom} />
                <TileLayer
                    url={tileUrl}
                    attribution={attribution}
                />
                {countries
                    .filter(country => country.countryInfo?.lat && country.countryInfo?.long)
                    .map((country) => {
                        const isSelected = selectedCountry === country.countryInfo.iso2;
                        return (
                            <Circle
                                key={`${country.country}-${casesType}`}
                                ref={(el) => {
                                    if (el) {
                                        circleRefs.current[country.countryInfo.iso2] = el;
                                    }
                                }}
                                center={[country.countryInfo.lat, country.countryInfo.long]}
                                pathOptions={{
                                    color: casesTypeColors[casesType].hex,
                                    fillColor: casesTypeColors[casesType].hex,
                                    fillOpacity: isSelected ? 0.8 : 0.4,
                                    weight: isSelected ? 3 : 1,
                                }}
                                radius={
                                    Math.sqrt(country[casesType]) * casesTypeColors[casesType].multiplier
                                }
                            >
                                <Popup>
                                    <div className="info-container">
                                        <div
                                            className="info-flag"
                                            style={{ backgroundImage: `url(${country.countryInfo.flag})` }}
                                        ></div>
                                        <div className="info-name">{country.country}</div>
                                        <div className="info-confirmed">
                                            Cases: {numeral(country.cases).format("0,0")}
                                        </div>
                                        <div className="info-recovered">
                                            Recovered: {numeral(country.recovered).format("0,0")}
                                        </div>
                                        <div className="info-deaths">
                                            Deaths: {numeral(country.deaths).format("0,0")}
                                        </div>
                                    </div>
                                </Popup>
                            </Circle>
                        );
                    })}
            </LeafletMap>
        </div>
    );
}

export default Map;
