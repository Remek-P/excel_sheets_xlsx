import {useRef, useState} from "react";

import ShowMetrics from "@/components/output/section/show/show-metrics/show-metrics";
import SectionLayout from "@/components/output/section/section-layout/section-layout";
import ActionToggle from "@/components/output/section/action-toggle/action-toggle";

import { Toggle } from "@carbon/react";

import classes from "../section-module.module.scss"

function Show({
                value,
                index,
                headerDataArray,
                labelDataArray,
                colDataArray,
                excludedArray,
                setExcludedArray,
                decimal,
              }) {

  const [showAllMetrics, setShowAllMetrics] = useState(false);
  const [showPercentages, setShowPercentages] = useState(undefined);

  const isNumber = useRef(undefined);
  const valueRef = useRef(null);
  const numbersEqualToZero = useRef(false);

  let chartData = [];

  const handleShowAllMetrics = () => {
    setShowAllMetrics(prevState => !prevState)
  };

  const excludeFromDisplaying = () => {
    setExcludedArray([...excludedArray, valueRef.current.value])
  }

  // Sent as props to
  const valueArray = [];

  const signsArray = ['%', '$', "US$", "USD", "AUD", "A$", "CAD", "C$", '€', "EUR", '¥', "JPY", '£', "GBP", "CNY", "PLN", "zł", ">", ">=", "<", "<="];

  return (
      <SectionLayout index={index}
                     value={value}
                     chartData={chartData}
                     isNumber={isNumber.current}
                     valueArray={valueArray}
                     showPercentages={showPercentages}
                     setShowPercentages={setShowPercentages}
      >

        <div>
          {
            headerDataArray.map((header, index) => {
                  // filter for the same value, to create a card view
                  if (header === value) {

                    const checkForString = typeof colDataArray[index] === "string";
                    // check if contains a symbol from the array
                    const checkIfStringContainsArray = checkForString && signsArray.filter(symbol => colDataArray[index].includes(symbol));

                    let cleanValue = colDataArray[index];

                    // if number is a string with a symbol, filter out the symbol sign to create a clean string
                    if (checkIfStringContainsArray.length > 0) {
                      for (const sign in checkIfStringContainsArray) {
                        cleanValue = checkForString && cleanValue.includes(checkIfStringContainsArray[sign]) ? cleanValue.replace(checkIfStringContainsArray[sign], "") : cleanValue;
                      }
                    } else cleanValue = colDataArray[index];
                    
                    // if displayed value is a number, assign true to isNumber.current to help display the actions for numerical values
                    if (typeof colDataArray[index] === "number") isNumber.current = true
                    // if displayed value is a number in a string, assign true to isNumber.current to help display the actions for numerical values
                    else if (checkForString) isNumber.current = !isNaN(+cleanValue);
                    else isNumber.current = false;

                    // Needed for displaying hide/show 0s toggle
                    if (+cleanValue === 0) numbersEqualToZero.current = true;

                    // Show data not equal to zero
                    if (!showAllMetrics) {
                      if (+cleanValue !== 0) {
                        valueArray.push(isNumber.current) //valueArray is sent as props and used to check if data is number
                        chartData.push({
                          group: labelDataArray[index],
                          value: +cleanValue
                        });

                        if (labelDataArray[index] === "Visual | See it | Intuition") console.log("cleanValue", isNumber.current)

                        return (
                            <ShowMetrics key={`${colDataArray[index]}+${labelDataArray[index]}`}
                                         index={index}
                                         colData={colDataArray[index]}
                                         labelData={labelDataArray[index]}
                                         showPercentages={showPercentages}
                                         decimal={decimal}
                            />
                        )
                      }
                    } else if (showAllMetrics) {
                      valueArray.push(isNumber.current) //valueArray is sent as props and used to check if data is number
                      chartData.push({
                        group: labelDataArray[index],
                        value: +cleanValue
                      });

                      return (
                          <ShowMetrics key={`${colDataArray[index]}+${labelDataArray[index]}`}
                                       index={index}
                                       colData={colDataArray[index]}
                                       labelData={labelDataArray[index]}
                                       showPercentages={showPercentages}
                                       decimal={decimal}
                          />
                      )
                    }
                  }
                }
            )
          }

          <div className={classes.toggleContainer}>
            
            <ActionToggle onClick={excludeFromDisplaying}
                          description="hide"
                          value={value}
                          valueRef={valueRef}
                          children="X"
            />

            {isNumber.current && numbersEqualToZero.current && <Toggle id={value}
                                         size="sm"
                                         labelA="show all"
                                         labelB="hide 0s"
                                         defaultToggled={false}
                                         onToggle={handleShowAllMetrics}
                                         labelText=""
                                         readOnly={false}
                                         aria-labelledby="show/hide all metrics"
                                         disabled={false}
                                         hideLabel={false}/>
            }
          </div>

        </div>

      </SectionLayout>
  );
}

export default Show;