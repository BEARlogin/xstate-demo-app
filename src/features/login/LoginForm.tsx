import React, {useMemo} from 'react'
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
import useLoginMachine from "./useLoginMachine";

export default observer(() => {

    const {state, send, onBlur, onChange, getError} = useLoginMachine();

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
                            onBlur={(e) => onBlur(e, 'email')}
                            onChange={(e) => onChange(e, 'email')}
                            error={getError('email')}
                        />
                        <FormInput
                            onBlur={(e) => onBlur(e, 'password')}
                            onChange={(e) => onChange(e, 'password')}
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
