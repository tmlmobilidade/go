"use client"

import { TextInput } from '@tmlmobilidade/ui';
import { IconDots } from '@tabler/icons-react';

import styles from './styles.module.css';

import { Breadcrumbs, Anchor } from '@mantine/core';
import React from 'react';

const items = [
    { title: 'Mantine', href: '#' },
    { title: 'Mantine hooks', href: '#' },
    { title: 'use-id', href: '#' },
].map((item, index) => (
    <Anchor href={item.href} key={index}>
        {item.title}
    </Anchor>
));

export default function SearchBar() {
    const [isOpen, setIsOpen] = React.useState(false);

    return <div className={styles.container}>
        {/* Search Bar */}
        <TextInput
            className={styles.input_text}
            maxLength={255}
            placeholder={"Pesquisar..."}
        // disabled
        // {...alertDetailData.form.getInputProps('title')}
        />

        {/* Settings Button */}
        <div className={styles.icon} onClick={() => setIsOpen((isOpen: boolean) => !isOpen)}>
            <IconDots />
            {isOpen && <Breadcrumbs className={styles.breadcrumbs}>{items}</Breadcrumbs>}
        </div>


    </div>;
}
