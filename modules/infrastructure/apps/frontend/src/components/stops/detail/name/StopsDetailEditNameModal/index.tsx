'use client';

import { Grid, Pane, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';

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

				<Grid columns="a" gap="md">
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
							/>
						)}
					/>
				</Grid>

				<Grid columns="ab" gap="md">
					{/* <TextInput
						label="Nome Curto"
						onChange={event => setShortName(event.target.value)}
						value={stopDetailContext.data.form.getValues()?.short_name ?? 'N/A'}
						variant="bordered"
					/>

					<TextInput
						label="Nome TTS"
						onChange={event => stopDetailContext.data.form.setFieldValue('tts_name', event.target.value)}
						value={stopDetailContext.data.form.getValues()?.tts_name ?? 'N/A'}
						variant="bordered"
					/> */}
				</Grid>

			</Section>
		</Pane>
	);
}
