'use client';

import { Divider, Pane, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';

import { useStopsDetailEditNameFormContext } from '../StopsDetailEditNameForm.context';
import { StopsDetailEditNameModalHeader } from '../StopsDetailEditNameModalHeader';

/* * */

export function StopsDetailEditNameModal() {
	//

	//
	// A. Setup variables

	const { form } = useStopsDetailEditNameFormContext();

	//
	// B. Render components

	return (
		<Pane header={[<StopsDetailEditNameModalHeader key="header" />]}>

			<Section>
				<StandardFormController
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={field.disabled}
							error={fieldState.error?.message}
							label="Nome Único da Paragem"
							onChange={event => field.onChange(event.target.value)}
							value={field.value ?? ''}
							variant="bordered"
							w="100%"
						/>
					)}
				/>
			</Section>

			<Divider />

			<Section gap="md">
				<StandardFormController
					control={form.control}
					name="short_name"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={field.disabled}
							error={fieldState.error?.message}
							label="Nome Curto"
							onChange={event => field.onChange(event.target.value)}
							value={field.value ?? ''}
							variant="bordered"
							w="100%"
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="tts_name"
					render={({ field, fieldState }) => (
						<TextInput
							disabled={field.disabled}
							error={fieldState.error?.message}
							label="Nome Fonético"
							onChange={event => field.onChange(event.target.value)}
							value={field.value ?? ''}
							variant="bordered"
							w="100%"
						/>
					)}
				/>
			</Section>

		</Pane>
	);
}
