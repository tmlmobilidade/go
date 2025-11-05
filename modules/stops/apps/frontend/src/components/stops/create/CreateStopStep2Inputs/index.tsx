'use client';

/* * */

import { useStopCreateContext } from '@/contexts/StopCreate.context';
import { Divider, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function CreateStopStep2Inputs() {
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
						description="Este é o nome principal e será apresentado nos canais digitais."
						label="Designação Completa da Paragem"
						{...stopCreateContext.data.form.getInputProps('name')}
						required
					/>
				</Grid>
			</Section>

			<Divider />

			<Section>
				<Grid columns="a" gap="md">
					<TextInput
						description="Esta versão abreviada automaticamente será utilizada em suportes com limitações de espaço, como postaletes e horários impressos."
						label="Nome Curto (automático)"
						readOnly={true}
						value={stopCreateContext.data.form.values.short_name}
					/>
					<TextInput
						description="O nome a ser utilizado pelo sistema de TTS (Text-to-Speech)."
						label="Nome TTS (automático)"
						readOnly={true}
						value={stopCreateContext.data.form.values.tts_name}
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
