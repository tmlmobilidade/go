/* * */

import { Divider, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';

import { useStopsCreateFormContext } from '../StopsCreateForm.context';

/* * */

export function StopsCreateStepNames() {
	//

	//
	// A. Setup variables

	const { form } = useStopsCreateFormContext();

	//
	// B. Render components

	return (
		<>

			<Section gap="sm">
				<StandardFormController
					control={form.control}
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
			</Section>

			<Divider />

			<Section gap="sm">

				<TextInput
					description="Esta versão abreviada automaticamente será utilizada em suportes com limitações de espaço, como postaletes e horários impressos."
					label="Nome Curto (automático)"
					value=""
					w="100%"
					readOnly
				/>

				<TextInput
					description="O nome a ser utilizado pelo sistema de TTS (Text-to-Speech)."
					label="Nome TTS (automático)"
					value=""
					w="100%"
					readOnly
				/>

			</Section>

		</>
	);
}
