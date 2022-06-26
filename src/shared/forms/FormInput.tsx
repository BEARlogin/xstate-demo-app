import React, {InputHTMLAttributes} from "react";
import './FormInput.css'

export interface FormInputParams extends InputHTMLAttributes<HTMLInputElement> {
    error?: string
}

export default function FormInput({error, ...rest}: FormInputParams) {
    return (
        <div className={"form-input"}>
            <input
                {...rest} />
            {error && <div style={{color: 'red'}}>{error}</div>}
        </div>
    )

}
