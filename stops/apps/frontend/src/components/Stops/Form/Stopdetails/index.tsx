'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { IconAB } from '@tabler/icons-react';
import { operationalStatusSchema } from '@tmlmobilidade/types';
import { Button, Collapsible, Combobox, Grid, NumberInput, Section, TextInput, Tooltip } from '@tmlmobilidade/ui';

/* * */

export function StopDetails() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const operationalStatusItems = operationalStatusSchema.options.map (value => ({
		label: Translations.OPERATIONAL_STATUS[value],
		value: value,
	}));

	//
	// B. Handle actions

	const handlePlayPhoneticName = async () => {
		if (typeof window !== 'undefined') {
			const synth = window.speechSynthesis;

			const utterance = new SpeechSynthesisUtterance(stopDetailContext.data.form.values.tts_name || '');
			utterance.lang = 'pt';
			synth.speak(utterance);
		}
	};

	//
	// C. Render components

	return (
		<Collapsible
			description="Informações gerais sobre esta paragem."
			title="Detalhes desta Paragem"
		>
			<Section>
				<Grid columns="ab" gap="sm">
					<TextInput
						label="Código Único da Paragem"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('_id')}
					/>
					<TextInput
						label="Código antigo da paragem"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('legacy_id')}
					/>
					<NumberInput
						label="Latitude"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('latitude')}
					/>
					<NumberInput
						label="Longitude"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('longitude')}
					/>

				</Grid>
			</Section>

			<Section gap="md">
				<TextInput
					label="Antigo Nome da Paragem (p/ alterar)"
					miw="100%"
					placeholder="..."
					{...stopDetailContext.data.form.getInputProps('name')}
				/>
				<TextInput
					label="Nome da Paragem (depois da correção)"
					miw="100%"
					placeholder="..."
					{...stopDetailContext.data.form.getInputProps('new_name')}
				/>
				<TextInput
					label="Nome Curto (Postalete)"
					miw="100%"
					placeholder="..."
					{...stopDetailContext.data.form.getInputProps('short_name')}
				/>
				<TextInput
					label="Nome Falado (Text-to-Speech)"
					miw="100%"
					placeholder="..."
					{...stopDetailContext.data.form.getInputProps('tts_name')}
					rightSection={(
						<Tooltip label="tts">
							<Button icon={<IconAB />} onClick={handlePlayPhoneticName} />
						</Tooltip>
					)}
				/>
			</Section>

			<Section gap="md">
				<Combobox
					data={operationalStatusItems}
					defaultValue={Translations.OPERATIONAL_STATUS.voided}
					label="Estado Operacional"
					placeholder="Escolha uma opção"
					fullWidth
					{...stopDetailContext.data.form.getInputProps('operational_status')}
				/>
			</Section>

		</Collapsible>
	);

	//
}
