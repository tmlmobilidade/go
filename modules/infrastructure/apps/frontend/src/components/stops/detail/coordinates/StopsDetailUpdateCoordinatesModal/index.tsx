'use client';

import { Grid, Pane, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useStopsDetailUpdateCoordinatesFormContext } from '../StopsDetailUpdateCoordinatesForm.context';
import { StopsDetailUpdateCoordinatesModalHeader } from '../StopsDetailUpdateCoordinatesModalHeader';
import { StopsDetailUpdateCoordinatesModalMap } from '../StopsDetailUpdateCoordinatesModalMap';

/* * */

export function StopsDetailUpdateCoordinatesModal() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { form } = useStopsDetailUpdateCoordinatesFormContext();

	//
	// B. Render components

	return (
		<Pane header={[<StopsDetailUpdateCoordinatesModalHeader key="header" />]}>
			<StopsDetailUpdateCoordinatesModalMap />
			<Section>
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={form.control}
						name="latitude"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={field.disabled}
								error={fieldState.error?.message}
								label={t('default:stops.detail.UpdateCoordinatesModal.fields.latitude.label')}
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
								label={t('default:stops.detail.UpdateCoordinatesModal.fields.longitude.label')}
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
