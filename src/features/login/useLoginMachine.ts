import {
    FormFieldConfigValidationResult,
    FormMachineFactoryParams
} from "../../shared/forms/form-machine";
import {authStore} from "../../shared/stores/Auth";
import useFormMachine from "../../shared/forms/useFormMachine";

export default function useLoginMachine() {
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

    return {
        ...useFormMachine(formConfig)
    }
}
