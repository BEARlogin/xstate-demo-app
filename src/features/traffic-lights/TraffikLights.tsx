import React, {useMemo} from "react";
import './styles.css'
import {useActor, useMachine} from "@xstate/react";
import {trafficLightsMachine} from "./traffic-lights-machine";
import TrafficLightsLight from "./TraffikLightsLight";

export default function TrafficLights() {
    const machine = useMemo(() => trafficLightsMachine,[])
    const [state, send] = useMachine(machine);
    const [stateChild] = useActor(state.context.child);

    return (
        <div>
            <div className={"wrap"}>
                <div className={"section"}>
                    <TrafficLightsLight color={"red"} active={state.matches('red') || state.matches('red_switching')}/>
                    <TrafficLightsLight color={"yellow"} active={state.matches('yellow')}/>
                    <TrafficLightsLight color={"green"} active={state.matches('green')}
                                        flashing={state.matches('green_switching')}/>
                </div>
                <div className={"section"}>
                    <TrafficLightsLight color={"red"} active={(stateChild as any).matches('red')}/>
                    <TrafficLightsLight color={"green"} active={(stateChild as any).matches('green')}
                                        flashing={(stateChild as any).matches('green_switching')}/>
                </div>
            </div>
            <button onClick={() => {send('BLOCK')}}>BLOCK</button>
            <button onClick={() => {send('UNBLOCK')}}>UNBLOCK</button>
            <div>
                {JSON.stringify(state.context)}
            </div>
        </div>

    )
}
