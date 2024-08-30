import { useRef, useState } from "react";

import SectionLayout from "@/components/output/section/section-layout/section-layout";

import {dateValidator} from "@/utils/dateUtils";
import ShowNumbers from "@/components/output/section/show/show-metrics/show-numbers";
import ShowStringsAsNumbers from "@/components/output/section/show/show-metrics/show-strings-as-numbers";


function Show({
                value,
                decimal,
                colDataArray,
                labelDataArray,
                headerDataArray,
                excludedArray,
                setExcludedArray,
              }) {

  const [showAllMetrics, setShowAllMetrics] = useState(false);
  const [showPercentages, setShowPercentages] = useState(undefined);
  const [sort, setSort] = useState(undefined)

  const isNumber = useRef(undefined);
  const numbersEqualToZero = useRef(false);

  const chartData = [];

  // Sent as props to SectionLayout in case the data is of mixed type
  const valueArray = [];
  const headerValueArray = [];
  const labelValueArray = [];

  const checkForNumber = (data) => !isNaN(+data);
  const checkForString = (data) => typeof data === "string";

  const symbolsArray = [">", ">=", "<", "<=","%", "p%", "$", "US$", "USD", "AUD", "A$", "CAD", "C$", "€", "EUR", "¥", "JPY", "£", "GBP", "CNY", "PLN", "zł"];
  const escapedRegexSymbolArray = symbolsArray.map(item => item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // const regexCheckForNumberWithSymbolBefore = new RegExp(`^(${escapedRegexSymbolArray.join("|")})\\s*\\d+(\\.\\d+)?$`);
  // const regexCheckForNumberWithSymbolAfter = new RegExp(`^\\d+(\\.\\d+)?\\s*(${escapedRegexSymbolArray.join("|")})$`);
  const regexOverall = new RegExp(`^((${escapedRegexSymbolArray.join("|")})\\s*|\\s*(${escapedRegexSymbolArray.join("|")})\\s*)?\\d+(\\.\\d+)?\\s*(${escapedRegexSymbolArray.join("|")})?$`);

  const separateNumbersAndStrings = (data) => {
    // Check if data contains any symbols from symbols Array
    const checkSymbolsInArray = symbolsArray.filter(symbol => data.includes(symbol));

    let numberOnlyData = data;
    // if number is a string with a symbol, filter out the symbol sign to create a clean string
    if (checkSymbolsInArray.length > 0) {
      for (const symbol in checkSymbolsInArray) {
        numberOnlyData = numberOnlyData.replace(checkSymbolsInArray[symbol], "").trim()
      }
    }

    return { numberOnlyData, checkSymbolsInArray };
  }

  const handleChartData = (type, index, value) => {
    valueArray.push(type) //valueArray is sent as props and used to check if data is number
    chartData.push({
      group: sortedLabels[index],
      value
    });
  }

  const handleChartDataIfDataIs0AndNot0 = (isItANumber, indexOfALabel, numberDataValue) => {
    if (!showAllMetrics) {
      if (numberDataValue !== 0) handleChartData(isItANumber, indexOfALabel, numberDataValue);
    } else handleChartData(isItANumber, indexOfALabel, numberDataValue);
  }

  headerDataArray.map((header, index) => {
    if (header === value) {
      headerValueArray.push(colDataArray[index]);
      labelValueArray.push(labelDataArray[index]);
    }
  })

  // TODO: percentages and pseudo-numerical values treated like strings
  // TODO: sort function is mutating data, so data is never displayed in an unsorted manner
  const sortDataAndLabelsArrayTogether = () => {

    if (sort === undefined) {
      const sortedData = headerValueArray;
      const sortedLabels = labelValueArray;
      
      return { sortedData, sortedLabels };
    }

    // Create an array of indices
    const indexedDataArray = headerValueArray.map((value, index) => ({ value, label: labelValueArray[index], index }));

    if (sort || sort === false) {
      // Sort the indexed data based on the value and sort direction
      indexedDataArray.sort((a, b) => {

        const isA_Number = checkForNumber(a.value);
        const isB_Number = checkForNumber(b.value);
        // Sorting, if data are numbers (number as a string or number)
        if (isA_Number && isB_Number) {
          if (sort) return +a.value - +b.value;
          else return +b.value - +a.value;
        }

        // Are data
        const isA_String = checkForString(a.value);
        const isB_String = checkForString(b.value);
        const bothAreStrings = isA_String && isB_String

        // regex test
        const numberAsStringWithSymbolsA = regexOverall.test(a.value);
        const numberAsStringWithSymbolsB = regexOverall.test(b.value);
        const bothPassedRegex = numberAsStringWithSymbolsA & numberAsStringWithSymbolsB

        // Sorting if data are strings numbers with symbols from symbolsArray
        if (bothAreStrings && bothPassedRegex) {

          // extract number
          const numberOnlyDataA = +separateNumbersAndStrings(a.value).numberOnlyData;
          const numberOnlyDataB = +separateNumbersAndStrings(b.value).numberOnlyData;

          if (sort) return numberOnlyDataA - numberOnlyDataB;
          else return numberOnlyDataB - numberOnlyDataA;
        }

        // In every other case use local sorting
        if (sort) return a.value.localeCompare(b.value);
        else return b.value.localeCompare(a.value);
      });

      // Separate the sorted values and labels back into their respective arrays
      const sortedData = indexedDataArray.map(item => item.value);
      const sortedLabels = indexedDataArray.map(item => item.label);

      return { sortedData, sortedLabels };
    }
  }

  const {sortedData, sortedLabels} = sortDataAndLabelsArrayTogether();
  
  return (

      <SectionLayout value={value}
                     sort={sort}
                     setSort={setSort}
                     chartData={chartData}
                     valueArray={valueArray}
                     showPercentages={showPercentages}
                     setShowPercentages={setShowPercentages}
                     excludedArray={excludedArray}
                     setExcludedArray={setExcludedArray}
                     numbersEqualToZero={numbersEqualToZero}
                     setShowAllMetrics={setShowAllMetrics}
      >

        <div>
          {
            sortedData.map((data, index) => {


              const isDate = dateValidator(data);

              // TODO: if (data.trim() === 0) return null

              if (checkForNumber(data)) {
                if (data === 0) numbersEqualToZero.current = true;
                isNumber.current = true;
                const numberData = {
                  value: data,
                  label: sortedLabels[index],
                }

                handleChartDataIfDataIs0AndNot0(isNumber.current, index, numberData.value)

                return (
                    <ShowNumbers key={`${data}+${sortedLabels[index]}`}
                                 data={numberData}
                                 decimal={decimal}
                                 showAllMetrics={showAllMetrics}
                                 showPercentages={showPercentages}
                    />
                )

              } else if (checkForString(data)) {

                const numberAsString = regexOverall.test(data);

                if (numberAsString) {

                  const { numberOnlyData, checkSymbolsInArray} = separateNumbersAndStrings(data);

                  if (+numberOnlyData === 0) numbersEqualToZero.current = true;

                  isNumber.current = true;
                  const numberData = {
                    value: +numberOnlyData,
                    symbolsArray: checkSymbolsInArray,
                    label: sortedLabels[index],
                    unrefined: data,
                  }

                  handleChartDataIfDataIs0AndNot0(isNumber.current, index, +numberData.value)

                  return <ShowStringsAsNumbers key={`${data}+${sortedLabels[index]}`}
                                               data={numberData}
                                               decimal={decimal}
                                               showAllMetrics={showAllMetrics}
                                               showPercentages={showPercentages}
                  />

                } else if (isDate) {
                  isNumber.current = false;
                  const dateData = {

                    value: data,
                    label: sortedLabels[index],
                  }
                } else {
                  isNumber.current = false;
                  const stringData = {
                    isNumber: false,
                    value: data,
                    label: sortedLabels[index],
                  };
                }

              } else {
                isNumber.current = false;
                const stringData = { value: data };
              }
            })
          }

        </div>

      </SectionLayout>
  );
}

export default Show;