import { ReactNode } from 'react';
import { Checkbox, TextInput } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

interface ItemProps {
    color?: "green" | "purple";
    label: string;
    type?: string;
    value: string | boolean;
    description?: string;
    placeholder?: string;
    children?: ReactNode;
}

export default function Item({ color, label, description, value, placeholder, children }: ItemProps) {
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
                    className={color === "purple" ? styles.input_text_purple : styles.input_text}
                    description={description}
                    label={label}
                    maxLength={255}
                    placeholder={placeholder}
                    disabled
                // {...alertDetailData.form.getInputProps('title')}
                />
                <div className={
                    color === "green" ?
                        styles.icon_green :
                        color === "purple" ?
                            styles.icon_purple :
                            styles.icon_blue}
                >
                    {children}
                </div>
            </>
        }
        {/* Text Input */}
        {
            typeof value === "string" && !children &&

            <TextInput
                className={color === "green" ? styles.input_text_green : styles.input_text}
                description={description}
                label={label}
                maxLength={255}
                placeholder={placeholder}
                disabled
                value={value}
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
