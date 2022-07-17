import React from "react";
import './styles.css'
import {useMachine} from "@xstate/react";
import {trafficLightsMachine} from "./traffic-lights-machine";

export default function TrafficLightsLight({color, active, flashing }: {color:string, active?: boolean, flashing?:boolean}) {
    return (
        <div className={`${color} light ${!active && !flashing ? 'disabled': ''} ${flashing ? 'flashing': ''}`}></div>
    )
}
