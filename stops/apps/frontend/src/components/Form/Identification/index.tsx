'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { StopOptions } from '@/utils/options.utils';
import { TextInput } from '@tmlmobilidade/ui';
import React from 'react';

import styles from './styles.module.css';

export function Identification() {
	//

	//
	// A. Setup Variables
	const stopDetailsContext = useStopsDetailContext();

	//
	// B. Handle actions
	const handleShortName = (name) => {
		// Return if stop has no name
		if (!name) return;
		// Copy the name first
		let shortenedStopName = name;
		// Shorten the stop name
		StopOptions.name_abbreviations
			.filter(abbreviation => abbreviation.enabled)
			.forEach((abbreviation) => {
				const regexExpression = new RegExp(abbreviation.phrase, 'g');
				shortenedStopName = shortenedStopName.replace(regexExpression, abbreviation.replacement);
			});
		// Save the new name
		stopDetailsContext.data.form.setFieldValue('short_name', shortenedStopName);
	};

	//
	// C. Render components
	return (
		<div className={styles.container}>
			<TextInput
				label="Código Único da Paragem"
				maxLength={255}
				placeholder="012345"
				{...stopDetailsContext.data.form.getInputProps('_id')}
			/>

			<TextInput
				description="Introduza o nome completo da paragem, sem abreviaturas."
				label="Nome da Paragem"
				maxLength={255}
				placeholder="Rua Marquês de Pombal 8"
				{...stopDetailsContext.data.form.getInputProps('name')}
				onChange={(event) => {
					stopDetailsContext.data.form.setFieldValue('name', event.currentTarget.value);
					handleShortName(event.currentTarget.value);
				}}
			/>

			<TextInput
				description="O nome curto é automaticamente construído com base nas abreviaturas mais comuns."
				label="Nome Curto (Postalete)"
				maxLength={255}
				placeholder="R. Mrq. de Pombal 8"
				disabled
				{...stopDetailsContext.data.form.getInputProps('short_name')}
			/>
		</div>
	);
}
