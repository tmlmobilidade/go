'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { operationalStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, SegmentedControl, TextInput, ValueDisplay } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionGeneral() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const operationalStatusItems = operationalStatusSchema.options.map(value => ({
		label: Translations.OPERATIONAL_STATUS[value],
		value: value,
	}));

	//
	// C. Handle actions

	const handlePlayPhoneticName = async () => {
		if (typeof window !== 'undefined') {
			const synth = window.speechSynthesis;
			const utterance = new SpeechSynthesisUtterance(stopDetailContext.data.form.values.tts_name || '');
			utterance.lang = 'pt';
			synth.speak(utterance);
		}
	};

	//
	// D. Render components

	return (
		<Collapsible
			description="Informações gerais sobre esta paragem."
			title="Detalhes desta Paragem"
		>

			<Section>
				<Grid columns="abcd" gap="md">
					<ValueDisplay label="Código Único da Paragem" value={stopDetailContext.data.stop?._id ?? 'N/A'} bordered />
					<ValueDisplay label="Código do Operador (legacy)" value={stopDetailContext.data.stop?.legacy_id ?? 'N/A'} bordered />
					<ValueDisplay label="Latitude" value={stopDetailContext.data.stop?.latitude ?? 'N/A'} bordered />
					<ValueDisplay label="Longitude" value={stopDetailContext.data.stop?.longitude ?? 'N/A'} bordered />
				</Grid>
			</Section>

			<Section gap="md">
				<SegmentedControl
					data={operationalStatusItems}
					onChange={(value: typeof operationalStatusSchema.options[number]) => stopDetailContext.data.form.setFieldValue('operational_status', value)}
					value={stopDetailContext.data.form.values.operational_status}
					fullWidth
				/>
			</Section>

			<Section>
				<Grid columns="a" gap="md">
					<TextInput
						label="Antigo Nome da Paragem (p/ alterar)"
						{...stopDetailContext.data.form.getInputProps('name')}
					/>
					<TextInput
						label="Nome da Paragem (depois da correção)"
						{...stopDetailContext.data.form.getInputProps('new_name')}
					/>
				</Grid>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<ValueDisplay label="Nome Curto" value={stopDetailContext.data.stop?.short_name ?? 'N/A'} bordered />
					<ValueDisplay label="Nome TTS" value={stopDetailContext.data.stop?.tts_name ?? 'N/A'} bordered />
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
