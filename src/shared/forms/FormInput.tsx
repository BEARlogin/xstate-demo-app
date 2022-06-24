import React, {InputHTMLAttributes} from "react";

export interface FormInputParams extends InputHTMLAttributes<HTMLInputElement> {
    error?: string
}

export function FormInput({error, ...rest}: FormInputParams) {
    return (
        <div>
            <input
                {...rest} />
            {error && <div style={{color: 'red'}}>{error}</div>}
        </div>
    )

}
