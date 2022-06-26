import {createMachine} from 'xstate';

export enum States {
    dataEntry = 'dataEntry',
    awaitingResponse = 'awaitingResponse',
    dataEntryError = 'dataEntryError',
    serviceError = 'serviceError',
    formCanSend = 'formCanSend',
    signedIn = 'signedIn',
}

export enum Events {
    ENTER_DATA = 'ENTER_DATA',
    BLUR_DATA = 'BLUR_DATA',
    SUBMIT = 'SUBMIT',
}

export enum Actions {
    setField = 'setField',
    onAuthentication = 'onAuthentication'
}

export interface FormFieldConfigValidationResult {
    result: boolean,
    errorMessage?: string
}

export interface FormFieldConfig {
    required: boolean,
    field: string,
    validator?: (value: any) => FormFieldConfigValidationResult
}

export interface FormFieldErrors {
    [field: string]: {
        message: string
    }
}

export interface FormMachineContext {
    data: any,
    dataEntryErrors: FormFieldErrors,
    serviceErrors: any,
    fields: FormFieldConfig[],
}

export const formMachineFactory = ({fields}:{fields: FormFieldConfig[]}) => {
    return createMachine({
            id: 'login',
            initial: States.dataEntry,
            context: {
                data: {},
                dataEntryErrors: {} as FormFieldErrors,
                serviceErrors: {} as FormFieldErrors,
                fields,
            } as FormMachineContext,
            states: {
                [States.dataEntry]: {
                    on: {
                        [Events.ENTER_DATA]: {
                            actions: Actions.setField,
                        },
                        [Events.BLUR_DATA]: [
                            { cond: 'isInvalid', target: States.dataEntryError },
                            { cond: 'canSubmit', target: States.formCanSend },
                        ],
                    }
                },
                [States.formCanSend]: {
                    on: {
                        [Events.SUBMIT]: {
                            target: States.awaitingResponse
                        },
                        ENTER_DATA: {
                            actions: Actions.setField,
                            target: States.dataEntry
                        },
                    },
                },
                [States.awaitingResponse]: {
                    invoke: {
                        src: 'requestSignIn',
                        onDone: {
                            target: States.signedIn
                        },
                        onError: [
                            {
                                cond: 'isServiceError',
                                target: States.serviceError
                            }
                        ]
                    }
                },
                [States.dataEntryError]: {
                    on: {
                        ENTER_DATA: {
                            actions: Actions.setField,
                            target: States.dataEntry
                        },
                    }
                },
                [States.serviceError]: {},
                [States.signedIn]: {
                    type: 'final',
                    onDone: {
                        actions: 'onAuthentication'
                    },
                },
            },
        },
        {
            services: {
                requestSignIn: async () => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => {
                            resolve({
                                role: 'admin',
                                login: 'admin'
                            })
                        }, 2000)
                    });
                }
            },
            actions: {
                [Actions.setField]: (context, event) => {
                    context.data[event.data.field] = event.data.value
                    delete context.dataEntryErrors[event.data.field]
                },
                [Actions.onAuthentication]: (context, event) => {
                    console.log('authenticated')
                }
            },
            guards: {
                isInvalid: (context, event) => {
                    const field = context.fields.find(f => f.field === event.data.field);

                    const result: FormFieldConfigValidationResult = field.validator ? field.validator(event.data.value) : {
                        result: true
                    };

                    if (!result.result) {
                        context.dataEntryErrors[event.data.field] = {
                            message: result.errorMessage,
                        };
                    }
                    return !result.result
                },
                canSubmit: (context) => {
                    return context.fields.reduce((acc,val) => {
                        const fieldValue = context.data[val.field];
                        const reqPredicate = val.required ? !!fieldValue : true;
                        return acc &&
                            (typeof val.validator === 'function' ?
                            val.validator(context.data[val.field]).result : true) && reqPredicate
                    }, true)
                }
            }
        }
    );
}
