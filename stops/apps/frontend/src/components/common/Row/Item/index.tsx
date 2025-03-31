import { ReactNode } from 'react';
import { Checkbox, Tag, TextInput } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

interface ItemProps {
    label: string;
    type?: string;
    value: string | boolean;
    placeholder?: string;
    children?: ReactNode;
}

export default function Item({ label, type, value, placeholder, children }: ItemProps) {
    return <div className={
        typeof value === "boolean" ?
            styles.input_checkbox_container :
            styles.input_text_container
    }>
        <div className={styles.label}>{label}</div>
        {/* Text */}
        {
            typeof value === "string" &&
            <input
                className={styles.input_text}
                type={"text"}
                value={value}
                placeholder={placeholder || ""}
                readOnly
            />
        }
        {/* <TextInput
            description="É importante que o título seja curto e claro, para que não apareça cortado no site, apps, etc."
            label="Título Curto"
            maxLength={255}
            placeholder="..."
            withAsterisk
            // {...alertDetailData.form.getInputProps('title')}
        /> */}
        {/* Checkbox */}

        {
            typeof value === "boolean" &&
            <input
                className={styles.input_checkbox}
                type={"checkbox"}
                checked={value}
                placeholder={placeholder || ""}
                readOnly
            />
        }
        {children}
    </div>;
}
