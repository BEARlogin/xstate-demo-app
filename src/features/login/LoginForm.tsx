import React, {useEffect, useMemo, useState} from 'react'
import {useMachine} from '@xstate/react';
import {
    Events,
    FormFieldConfigValidationResult,
    formMachineFactory,
    FormMachineFactoryParams,
    States
} from "../../shared/forms/form-machine";
import FormInput from "../../shared/forms/FormInput";
import {authStore} from "../../shared/stores/Auth";
import {observer} from "mobx-react";

export default observer(() => {
    const formConfig: FormMachineFactoryParams = {
        fields: [
            {
                field: 'email',
                required: true,
                validator: (value: string): FormFieldConfigValidationResult => {
                    if (!value) {
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
        ],
        onSubmit: (context) => authStore.auth(context.data.email, context.data.password),
        onDone: () => {
            console.log('AUth!')
        }
    }

    // При перерендере машина должна сохранятся
    const loginMachine = useMemo(() => formMachineFactory(formConfig), []);
    const [state, send] = useMachine(loginMachine);

    function getError(field: string) {
        const error = state.context.dataEntryErrors[field];
        return error && (error.message || `${field} error`);
    }

    function sendEvent(config: { field: string, type: Events, event: any }) {
        const {type, event, field} = config;
        send({
            type,
            data: {
                value: event.target.value,
                field,
            }
        })
    }

    return (<div>
            {state.matches(States.success) ?
                <>
                    User logged in
                    <pre>{JSON.stringify(authStore.user, null, "\t")}</pre>
                </>
                : <>
                    <div style={{textAlign: "center"}}>
                        <div style={{marginBottom: "1rem"}}>
                            Current State is <b>{state.value.toString()}</b>
                        </div>
                        <FormInput
                            onBlur={(event) => sendEvent({
                                type: Events.BLUR_DATA,
                                event: event,
                                field: 'email',
                            })}
                            onChange={(event) => sendEvent({
                                type: Events.ENTER_DATA,
                                event: event,
                                field: 'email',
                            })}
                            error={getError('email')}
                        />
                        <FormInput
                            onBlur={(event) => sendEvent({
                                type: Events.BLUR_DATA,
                                event,
                                field: 'password',
                            })}
                            onChange={(event) => sendEvent({
                                type: Events.ENTER_DATA,
                                event,
                                field: 'password',
                            })}
                            error={getError('password')}
                        />

                        {state.matches(States.awaitingResponse) ? 'Loading...' :
                            <button disabled={!state.context.canSubmit && !state.matches(States.serviceError)}
                                    onClick={() => send(Events.SUBMIT)}>Login</button>}

                        {state.matches(States.serviceError) && <div style={{color: 'red'}}>
                            Service error: {state.context.serviceErrors['error.platform']}. Try again.</div>}

                    </div>
                    <pre>{JSON.stringify(state.context, null, 4)}</pre>
                </>
            }
        </div>
    )
})
