import React, { useRef } from "react";
import "./CenteredProgressBar.css";

interface ProgressBarProps {
    value: number;
}

const CenteredProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
    let percentage = Math.abs(value) * 5;
    const progressbar = useRef<HTMLDivElement>(null);

    // Ensure a minimum of 5%


    const isNegative = value < 0;
    const containerClassName = `progress-container ${isNegative ? "negative-container" : ""
        }`;

    const valueString = String(value);

    let displaySign = "";
    let displayValue = valueString;

    if (value > 0) {
        displaySign = "+";
    } else if (value < 0) {
        displaySign = "-";
        displayValue = valueString.substring(1);
    }

    return (
        <>

            <div className="container-progress">
                <div className={containerClassName}>
                    <div
                        className={`progress-bar ${isNegative ? "negative" : "positive"}`}
                        ref={progressbar}
                        style={{
                            width: `${percentage}%`,
                            left: "50%",
                            borderRadius: "0px 10px 10px 0px"
                        }}
                    ></div>
                </div>

                <div className="progress-val">
                    {
                        percentage != 0 &&
                        displaySign + " " + displayValue
                    }
                </div>

            </div>


        </>
    );
};

export default CenteredProgressBar;