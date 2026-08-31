'use client';

import { Grid, Pane, Section, TextInput } from '@tmlmobilidade/ui';

import { useStopsDetailEditCoordinatesFormContext } from '../StopsDetailEditCoordinatesForm.context';
import { StopsDetailEditCoordinatesModalHeader, StopsDetailEditNameModalHeader } from '../StopsDetailEditCoordinatesModalHeader';

/* * */

export function StopsDetailEditCoordinatesModal() {
	//

	//
	// A. Setup variables

	const { form } = useStopsDetailEditCoordinatesFormContext();

	//
	// B. Render components

	return (
		<Pane header={[<StopsDetailEditCoordinatesModalHeader key="header" />]}>
			<Section>

				<Grid columns="a" gap="md">
					<TextInput
						label="Nome Único da Paragem"
						onChange={event => form.setNameValue(event.target.value)}
						value={form.nameValue ?? ''}
						variant="bordered"
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
