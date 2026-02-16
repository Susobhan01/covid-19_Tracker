
import numeral from 'numeral';

export const sortData = (data, casesType = "cases") => {
  const sortedData = [...data];
  return sortedData.sort((a, b) => (
    (a[casesType] > b[casesType] ? -1 : 1)
  ));
};

export const prettyPrintStat = (stat) => (
  stat ? `+${numeral(stat).format("0.0a")}` : "+0"
);
