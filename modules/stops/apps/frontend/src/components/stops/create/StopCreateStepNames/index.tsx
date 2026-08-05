/* * */

import { ContextFormController, Divider, Section, TextInput } from '@tmlmobilidade/ui';

import { useStopCreateContext } from '../StopCreate.context';

/* * */

export function StopCreateStepNames() {
	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();

	//
	// B. Render components

	return (
		<Section gap="sm" width="100%">
			<ContextFormController
				control={stopCreateContext.form.instance.control}
				name="name"
				render={({ field, fieldState }) => (
					<TextInput
						description="Este é o nome principal e será apresentado nos canais digitais."
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
			<ContextFormController
				control={stopCreateContext.form.instance.control}
				name="short_name"
				render={({ field }) => (
					<TextInput
						description="Esta versão abreviada automaticamente será utilizada em suportes com limitações de espaço, como postaletes e horários impressos."
						label="Nome Curto (automático)"
						value={field.value ?? ''}
						w="100%"
						readOnly
					/>
				)}
			/>
			<ContextFormController
				control={stopCreateContext.form.instance.control}
				name="tts_name"
				render={({ field }) => (
					<TextInput
						description="O nome a ser utilizado pelo sistema de TTS (Text-to-Speech)."
						label="Nome TTS (automático)"
						value={field.value ?? ''}
						w="100%"
						readOnly
					/>
				)}
			/>
		</Section>
	);
}
