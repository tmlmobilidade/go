'use client';

import { getStopShortName, getStopTtsName } from '@tmlmobilidade/go-infrastructure-pckg-utils';
import { Divider, Pane, Section, StandardFormController, TextInput, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';

import { useStopsDetailUpdateNameFormContext } from '../StopsDetailUpdateNameForm.context';
import { StopsDetailUpdateNameModalHeader } from '../StopsDetailUpdateNameModalHeader';

/* * */

export function StopsDetailUpdateNameModal() {
	//

	//
	// A. Setup variables

	const { form } = useStopsDetailUpdateNameFormContext();

	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });

	//
	// B. Transform data

	const automaticShortName = useMemo(() => {
		if (!nameValue) return '';
		return getStopShortName(nameValue);
	}, [nameValue]);

	const automaticTtsName = useMemo(() => {
		if (!nameValue) return '';
		return getStopTtsName(nameValue);
	}, [nameValue]);

	//
	// C. Sync automatic values into form so they are submitted

	useEffect(() => {
		form.setValue('short_name', automaticShortName, { shouldDirty: true });
		form.setValue('tts_name', automaticTtsName, { shouldDirty: true });
	}, [automaticShortName, automaticTtsName, form]);

	//
	// D. Render components

	return (
		<Pane header={[<StopsDetailUpdateNameModalHeader key="header" />]}>

			<Section>
				<StandardFormController
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							description="Este é o nome principal e será apresentado nos canais digitais."
							disabled={field.disabled}
							error={fieldState.error?.message}
							label="Designação Completa da Paragem"
							onChange={field.onChange}
							value={field.value ?? ''}
							w="100%"
							data-autofocus
							required
						/>
					)}
				/>
			</Section>

			<Divider />

			<Section gap="sm">
				<TextInput
					description="Esta versão abreviada automaticamente será utilizada em suportes com limitações de espaço, como postaletes e horários impressos."
					label="Nome Curto (automático)"
					value={automaticShortName}
					w="100%"
					readOnly
				/>
				<TextInput
					description="O nome a ser utilizado pelo sistema de TTS (Text-to-Speech)."
					label="Nome TTS (automático)"
					value={automaticTtsName}
					w="100%"
					readOnly
				/>
			</Section>

		</Pane>
	);
}
