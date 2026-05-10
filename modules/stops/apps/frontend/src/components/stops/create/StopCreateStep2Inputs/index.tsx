'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { Divider, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopCreateStep2Inputs() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	return (
		<>

			<Section>
				<Grid columns="a" gap="md">
					<TextInput
						key={stopCreateContext.data.form.key('name')}
						description="Este é o nome principal e será apresentado nos canais digitais."
						label="Designação Completa da Paragem"
						data-autofocus
						required
						{...stopCreateContext.data.form.getInputProps('name')}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section>
				<Grid columns="a" gap="md">
					<TextInput
						defaultValue={stopCreateContext.data.form.values.short_name}
						description="Esta versão abreviada automaticamente será utilizada em suportes com limitações de espaço, como postaletes e horários impressos."
						label="Nome Curto (automático)"
						readOnly
					/>
					<TextInput
						defaultValue={stopCreateContext.data.form.values.tts_name}
						description="O nome a ser utilizado pelo sistema de TTS (Text-to-Speech)."
						label="Nome TTS (automático)"
						readOnly
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
