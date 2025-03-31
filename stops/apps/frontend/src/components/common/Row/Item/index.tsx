import { ReactNode } from 'react';
import { Checkbox, TextInput } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

interface ItemProps {
    label: string;
    type?: string;
    value: string | boolean;
    description?: string;
    placeholder?: string;
    children?: ReactNode;
}

export default function Item({ label, description, value, placeholder, children }: ItemProps) {
    return <div className={
        typeof value === "boolean" ?
            styles.input_checkbox_container :
            styles.input_text_container
    }>
        {/* Text Input */}
        {
            typeof value === "string" &&
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
            <Checkbox label={label} checked={value} disabled />
        }
        {children}
    </div>;
}
