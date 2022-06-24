import React, {useState} from 'react'
import {useMachine} from '@xstate/react';
import loginMachine, {Events, States} from "./login-machine";
import {FormInput} from "../shared/forms/FormInput";

export default function LoginForm() {

    const [state, send] = useMachine(loginMachine);

    function getError(field: string, text: string) {
        return state.context.dataEntryErrors[field] && text;
    }

    function formCanSend() {
        return state.matches(States.formCanSend)
    }

    function sendEvent(type: Events, inputEvent: any) {
        send({
            type,
            data: inputEvent.target.value
        })
    }

    return (<div>

        { state.matches(States.signedIn) ?
        'User logged in'
            : <>
                {state.value}
                {state.context.password}
                <div>
                    <FormInput onFocus={(e) => sendEvent(Events.ENTER_EMAIL,e)}
                               onBlur={(e) => sendEvent(Events.EMAIL_BLUR,e)}
                               onChange={(e) => sendEvent(Events.ENTER_EMAIL,e)}
                               error={getError('email','Email error')}
                    />
                </div>
                <div>
                    <FormInput
                                onFocus={(e) => sendEvent(Events.ENTER_PASSWORD,e)}
                               onBlur={(e) => sendEvent(Events.PASSWORD_BLUR,e)}
                               onChange={(e) => sendEvent(Events.ENTER_PASSWORD,e)}
                               error={getError('password','Password error')}
                    />
                </div>
                {state.matches(States.awaitingResponse) ? 'Loading...' :
                    <button disabled={!formCanSend()} onClick={() => send(Events.SUBMIT)} >Login</button>}
            </>
        }
    </div>)
}
