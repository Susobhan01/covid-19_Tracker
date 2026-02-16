
import React from 'react';
import numeral from 'numeral';
import './Table.css';

function Table({ countries, onCountryClick, casesType = "cases", selectedCountry }) {
    const activeColor = casesType === "recovered" ? "#7dd71d" : "#cc1034";

    return (
        <div className="table">
            {countries.map((country) => (
                <tr
                    key={country.country}
                    onClick={() => onCountryClick(country.countryInfo.iso2)}
                    data-selected={selectedCountry === country.countryInfo.iso2}
                    style={{ borderColor: selectedCountry === country.countryInfo.iso2 ? activeColor : 'transparent' }}
                >
                    <td>{country.country}</td>
                    <td><strong>{numeral(country[casesType]).format("0,0")}</strong></td>
                </tr>
            ))}
        </div>
    );
}

export default Table;
