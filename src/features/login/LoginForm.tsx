import React, {useEffect, useMemo, useState} from 'react'
import {useMachine} from '@xstate/react';
import {Events, FormFieldConfigValidationResult, formMachineFactory, States} from "../../shared/forms/form-machine";
import {FormInput} from "../../shared/forms/FormInput";

export default function LoginForm() {
    const formConfig = {
        fields: [
            {
                field: 'email',
                required: true,
                validator: (value: string): FormFieldConfigValidationResult => {
                    if(!value) {
                        return {
                            result: false,
                            errorMessage: 'Please Enter Email'
                        }
                    }
                    let regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

                    return {
                        result: !!value?.match(regexEmail),
                        errorMessage: 'Email wrong format'
                    }
                }
            },
            {
                field: 'password',
                required: true,
                validator: (value: string) => {
                    return {
                        result: value?.length >= 4,
                        errorMessage: 'Password length is less then 4'
                    }
                }
            },
        ]
    }
    const loginMachine = useMemo(() => formMachineFactory(formConfig),[]);
    const [state, send] = useMachine(loginMachine);

    function getError(field: string, text: string) {
        const error = state.context.dataEntryErrors[field];
        return error && (error.message || text);
    }

    function formCanSend() {
        return state.matches(States.formCanSend)
    }

    function sendEvent(config: { validator?: Function, field: string, type: Events, inputEvent: any }) {
        const {type, inputEvent, validator, field} = config;
        send({
            type,
            data: {
                value: inputEvent.target.value,
                validator,
                field,
            }
        })
    }

    return (<div>

            {state.matches(States.signedIn) ?
                'User logged in'
                : <>
                    {state.value}
                    <div>
                        <FormInput
                            onBlur={(e) => sendEvent({
                                type: Events.BLUR_DATA,
                                inputEvent: e,
                                field: 'email',
                            })}
                            onChange={(e) => sendEvent({
                                type: Events.ENTER_DATA,
                                inputEvent: e,
                                field: 'email',
                            })}
                            error={getError('email', 'Email error')}
                        />
                    </div>
                    <div>
                        <FormInput
                            onBlur={(e) => sendEvent({
                                type: Events.BLUR_DATA,
                                inputEvent: e,
                                field: 'password',
                            })}
                            onChange={(e) => sendEvent({
                                type: Events.ENTER_DATA,
                                inputEvent: e,
                                field: 'password',
                            })}
                            error={getError('password', 'Password error')}
                        />
                    </div>
                    {state.matches(States.awaitingResponse) ? 'Loading...' :
                        <button disabled={!formCanSend()} onClick={() => send(Events.SUBMIT)}>Login</button>}
                </>
            }
        </div>
    )
}
