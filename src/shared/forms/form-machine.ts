import {createMachine, send} from 'xstate';

export enum States {
    dataEntry = 'dataEntry',
    awaitingResponse = 'awaitingResponse',
    dataEntryError = 'dataEntryError',
    serviceError = 'serviceError',
    success = 'success',
}

export enum Events {
    ENTER_DATA = 'ENTER_DATA',
    BLUR_DATA = 'BLUR_DATA',
    SUBMIT = 'SUBMIT',
}

export enum Actions {
    setField = 'setField',
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
    canSubmit: boolean,
}

export interface FormMachineFactoryParams {
    fields: FormFieldConfig[],
    onSubmit: (context: FormMachineContext) => Promise<any>,
    onDone: (data: any) => any
}

function canSubmit(context: FormMachineContext) {
    if (Object.keys(context.fields).length === 0) {
        return true
    }
    return context.fields.reduce((acc, val) => {
        const fieldValue = context.data[val.field];
        const reqPredicate = val.required ? !!fieldValue : true;
        return acc &&
            (typeof val.validator === 'function' ?
                val.validator(context.data[val.field]).result : true) && reqPredicate
    }, true)
}

export const formMachineFactory = ({
   fields,
   onSubmit, onDone,
}: FormMachineFactoryParams) => {
    return createMachine({
            id: 'login',
            initial: States.dataEntry,
            context: {
                data: {},
                dataEntryErrors: {} as FormFieldErrors,
                serviceErrors: {} as FormFieldErrors,
                fields,
                canSubmit: false,
            } as FormMachineContext,
            states: {
                [States.dataEntry]: {
                    on: {
                        [Events.ENTER_DATA]: {
                            actions: Actions.setField,
                        },
                        [Events.BLUR_DATA]: [
                            {cond: 'isInvalid', target: States.dataEntryError},
                        ],
                        [Events.SUBMIT]: {
                            cond: 'canSubmitGuard',
                            target: States.awaitingResponse
                        },
                    },
                },
                [States.awaitingResponse]: {
                    id: 'submit',
                    invoke: {
                        src: (context) => {
                            return onSubmit(context);
                        },
                        onDone: {
                            target: States.success
                        },
                        onError: [
                            {
                                actions: (context, event) => {
                                    context.serviceErrors[event.type] = event.data;
                                },
                                target: States.serviceError
                            }
                        ]
                    }
                },
                [States.dataEntryError]: {
                    on: {
                        [Events.ENTER_DATA]: {
                            // При вводе данных при ошибке нам нужно как установить данные, так и переключить state
                            actions: Actions.setField,
                            target: States.dataEntry
                        },
                    }
                },
                [States.serviceError]: {
                    on: {
                        [Events.SUBMIT]: {
                            target: States.awaitingResponse
                        },
                        [Events.ENTER_DATA]: {
                            // При вводе данных при ошибке нам нужно как установить данные, так и переключить state
                            actions: Actions.setField,
                            target: States.dataEntry
                        },
                    }
                },
                [States.success]: {
                    type: 'final',
                    onDone: {
                        actions: onDone
                    },
                },
            },
        },
        {
            actions: {
                [Actions.setField]: (context, event) => {
                    context.data[event.data.field] = event.data.value;
                    delete context.dataEntryErrors[event.data.field];
                    context.canSubmit = canSubmit(context);
                },
            },
            guards: {
                isInvalid: (context, event) => {
                    if (!event.data.value) {
                        return false
                    }

                    const field = context.fields.find(f => f.field === event.data.field);

                    if (!field) {
                        return false
                    }

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
                canSubmitGuard: (context) => {
                    return context.canSubmit;
                }
            }
        }
    );
}
