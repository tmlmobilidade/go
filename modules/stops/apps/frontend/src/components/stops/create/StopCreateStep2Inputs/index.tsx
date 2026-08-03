'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { ContextFormController, Divider, Grid, Section, TextInput } from '@tmlmobilidade/ui';

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
					<ContextFormController
						control={stopCreateContext.data.form.control}
						name="name"
						render={({ field, fieldState }) => (
							<TextInput
								description="Este é o nome principal e será apresentado nos canais digitais."
								label="Designação Completa da Paragem"
								data-autofocus
								required
								value={field.value ?? ''}
								onChange={field.onChange}
								error={fieldState.error?.message}
							/>
						)}
					/>
				</Grid>
			</Section>

			<Divider />

			<Section>
				<Grid columns="a" gap="md">
					<ContextFormController
						control={stopCreateContext.data.form.control}
						name="short_name"
						render={({ field }) => (
							<TextInput
								description="Esta versão abreviada automaticamente será utilizada em suportes com limitações de espaço, como postaletes e horários impressos."
								label="Nome Curto (automático)"
								readOnly
								value={field.value ?? ''}
							/>
						)}
					/>
					<ContextFormController
						control={stopCreateContext.data.form.control}
						name="tts_name"
						render={({ field }) => (
							<TextInput
								description="O nome a ser utilizado pelo sistema de TTS (Text-to-Speech)."
								label="Nome TTS (automático)"
								readOnly
								value={field.value ?? ''}
							/>
						)}
					/>
				</Grid>
			</Section>

		</>
	);

	//
}
