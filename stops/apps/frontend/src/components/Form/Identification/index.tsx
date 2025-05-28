'use client';

import React from 'react';
import styles from './styles.module.css';
import { TextInput, Tooltip } from '@tmlmobilidade/ui';
import { StopOptions } from '@/utils/options.utils';
import { Button } from '@mantine/core';

export function Identification({ data }) {
    //

    //
    // A. Handle actions

    const handleShortName = () => {
        // Return if stop has no name
        if (!data.form.values.name || !data.form.values.short_name) return;
        // Copy the name first
        let shortenedStopName = data.form.values.name;
        // Shorten the stop name
        StopOptions.name_abbreviations
            .filter(abbreviation => abbreviation.enabled)
            .forEach((abbreviation) => {
                const regexExpression = new RegExp(abbreviation.phrase, 'g');
                shortenedStopName = shortenedStopName.replace(regexExpression, abbreviation.replacement);
            });
        // Save the new name
        data.form.setFieldValue('short_name', shortenedStopName);
    };

    //
    // B. Render components
    return (
        <div className={styles.container}>
            <TextInput
                label="Código Único da Paragem"
                maxLength={255}
                placeholder="012345"
                {...data.form.getInputProps('_id')}
            />

            <TextInput
                label="Nome da Paragem"
                description="Introduza o nome completo da paragem, sem abreviaturas."
                maxLength={255}
                placeholder="Rua Marquês de Pombal 8"
                {...data.form.getInputProps('name')}
            />

            <TextInput
                label="Nome Curto (Postalete)"
                description="O nome curto é automaticamente construído com base nas abreviaturas mais comuns."
                maxLength={255}
                placeholder="R. Mrq. de Pombal 8"
                disabled
                {...data.form.getInputProps('short_name')}
            />

            <Tooltip label="Gerar Nome Curto" position="bottom">
                <Button className={styles.button} onClick={() => handleShortName()}>
                    Gerar Nome Curto
                </Button>
            </Tooltip>

            <TextInput
                label="Localidade da Paragem"
                description="Introduza uma localidade para esta paragem."
                maxLength={255}
                placeholder="Bairro das Maçãs"
                {...data.form.getInputProps('locality_id')}
            />
        </div>
    );
}