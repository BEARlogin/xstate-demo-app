import {useMemo} from "react";
import {Events, formMachineFactory, FormMachineFactoryParams} from "./form-machine";
import {useMachine} from "@xstate/react";

export default function useFormMachine(formConfig: FormMachineFactoryParams) {
    // При перерендере машина должна сохранятся
    const machine = useMemo(() => formMachineFactory(formConfig), []);
    const [state, send] = useMachine(machine);

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

    function onBlur(event:any, field) {
        sendEvent({
            type: Events.BLUR_DATA,
            event,
            field,
        })
    }

    function onChange(event:any, field:string) {
        sendEvent({
            type: Events.ENTER_DATA,
            event,
            field,
        })
    }

    return {
        machine,
        state,
        send,
        sendEvent,
        onBlur,
        onChange,
        getError,
    }
}
