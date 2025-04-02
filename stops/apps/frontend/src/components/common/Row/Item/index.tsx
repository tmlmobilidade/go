import { ReactNode } from 'react';
import { Checkbox, TextInput } from '@tmlmobilidade/ui';

import styles from './styles.module.css';
import React from 'react';

interface ItemProps {
    label: string;
    type?: string;
    value: string | boolean;
    description?: string;
    placeholder?: string;
    children?: ReactNode;
}

export default function Item({ label, description, value, placeholder, children }: ItemProps) {
    // const [textUUID, setTextUUID] = React.useState("");

    // const generateUUID = () => {
    //     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    //         const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === 'x' ? 0 : 4);
    //         return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    //     });
    // }

    // const createIconElement = () => <div className={styles.icon_blue}>
    //     {children}
    // </div>;

    // const iconElement = React.createElement(createIconElement); // Create an element from the component


    // const appendIconToTextInput = () => {
    //     const textInput = document.getElementById(textUUID);
    //     textInput.appendChild(iconElement);

    // }

    // React.useEffect(() => {
    //     setTextUUID(generateUUID());
    // }, []);

    return <div className={
        typeof value === "boolean" ?
            styles.input_checkbox_container :
            children ? styles.input_text_container_with_icon :
                styles.input_text_container
    }>
        {/* Text Input with Icon */}
        {
            typeof value === "string" && children &&
            <>
                <TextInput
                    className={styles.input_text}
                    description={description}
                    label={label}
                    maxLength={255}
                    placeholder={placeholder}
                    disabled
                // {...alertDetailData.form.getInputProps('title')}
                />
                <div className={styles.icon_blue}>
                    {children}
                </div>
            </>
        }
        {/* Text Input */}
        {
            typeof value === "string" && !children &&

            <TextInput
                className={styles.input_text}
                description={description}
                label={label}
                maxLength={255}
                placeholder={placeholder}
                disabled
            // {...alertDetailData.form.getInputProps('title')}
            />

        }
        {/* Checkbox */}
        {
            typeof value === "boolean" &&
            <Checkbox className={styles.input_checkbox} label={label} checked={value} disabled />
        }
    </div >;
}
