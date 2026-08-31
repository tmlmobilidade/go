'use client';

import { Grid, Pane, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';

import { useStopsDetailUpdateCoordinatesFormContext } from '../StopsDetailUpdateCoordinatesForm.context';
import { StopsDetailUpdateCoordinatesModalHeader } from '../StopsDetailUpdateCoordinatesModalHeader';

/* * */

export function StopsDetailUpdateCoordinatesModal() {
	//

	//
	// A. Setup variables

	const { form } = useStopsDetailUpdateCoordinatesFormContext();

	//
	// B. Render components

	return (
		<Pane header={[<StopsDetailUpdateCoordinatesModalHeader key="header" />]}>
			<Section>
				<Grid>
					<StandardFormController
						control={form.control}
						name="latitude"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={field.disabled}
								error={fieldState.error?.message}
								label="Latitude"
								onChange={event => field.onChange(event.target.value)}
								value={field.value ?? ''}
								variant="bordered"
								w="100%"
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="longitude"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={field.disabled}
								error={fieldState.error?.message}
								label="Longitude"
								onChange={event => field.onChange(event.target.value)}
								value={field.value ?? ''}
								variant="bordered"
								w="100%"
							/>
						)}
					/>
				</Grid>
			</Section>
		</Pane>
	);
}
