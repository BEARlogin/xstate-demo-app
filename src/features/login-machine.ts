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
    ENTER_EMAIL = 'ENTER_EMAIL',
    ENTER_PASSWORD = 'ENTER_PASSWORD',
    EMAIL_BLUR = 'EMAIL_BLUR',
    PASSWORD_BLUR = 'PASSWORD_BLUR',
    SUBMIT = 'SUBMIT',
}

export enum Actions {
    setField = 'setField',
    onAuthentication = 'onAuthentication'
}

const mapEventToField = {
    [Events.ENTER_EMAIL]: 'email',
    [Events.ENTER_PASSWORD]: 'password',
};

const isEmailInvalid = (email: string) => {
    if(!email) {
        return true
    }
    let regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return !email?.match(regexEmail);
}

const isPasswordInvalid = (password: string) => {
    return password.length < 4;
}

export default createMachine({
        id: 'login',
        initial: States.dataEntry,
        context: {
            email: '',
            password: '',
            dataEntryErrors: {},
            serviceErrors: {}
        },
        states: {
            [States.dataEntry]: {
                on: {
                    [Events.ENTER_EMAIL]: {
                        actions: Actions.setField,
                    },
                    [Events.ENTER_PASSWORD]: {
                        actions: Actions.setField,
                    },
                    [Events.EMAIL_BLUR]: [
                        { cond: 'isEmailInvalid',target: States.dataEntryError },
                        { cond: 'canSubmit',target: States.formCanSend }
                    ],
                    [Events.PASSWORD_BLUR]: [
                        { cond: 'isPasswordInvalid', target: States.dataEntryError },
                        { cond: 'canSubmit', target: States.formCanSend }
                    ],
                }
            },
            [States.formCanSend]: {
                on: {
                    [Events.SUBMIT]: {
                        target: States.awaitingResponse
                    }
                }
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
                    ENTER_EMAIL: {
                        actions: Actions.setField,
                        target: States.dataEntry
                    },
                    ENTER_PASSWORD: {
                        actions: Actions.setField,
                        target: States.dataEntry
                    }
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
                const field = mapEventToField[event.type];
                context[field] = event.data
                delete context.dataEntryErrors[field]
            },
            [Actions.onAuthentication]: (context, event) => {
                console.log('authenticated')
            }
        },
        guards: {
            isEmailInvalid: (context) => {
                const result = isEmailInvalid(context.email);
                if (result) {
                    context.dataEntryErrors['email'] = {};
                }
                return result

            },
            isPasswordInvalid: (context) => {
                const result = isPasswordInvalid(context.password);
                if (result) {
                    context.dataEntryErrors['password'] = {};
                }
                return result
            },
            canSubmit: (context) => {
                return !isPasswordInvalid(context.password) && !isEmailInvalid(context.email)
            }
        }
    }
);
