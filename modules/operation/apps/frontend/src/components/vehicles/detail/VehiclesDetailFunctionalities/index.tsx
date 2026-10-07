'use client';

import { Checkbox, Collapsible, Grid, Section, StandardFormController } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesDetailFormContext } from '../VehiclesDetailForm.context';

/* * */

const FUNCTIONALITY_FIELDS = [
	'bicycles',
	'contactless',
	'passenger_counting',
	'climatization',
	'wheelchair',
	'corridor',
	'lowered_floor',
	'ramp',
	'folding_system',
	'kneeling',
	'static_information',
	'onboard_monitor',
	'front_display',
	'rear_display',
	'side_display',
	'internal_sound',
	'external_sound',
	'consumption_meter',
] as const;

/* * */

export function VehiclesDetailFunctionalities() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useVehiclesDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:vehicles.detail.VehiclesDetailFunctionalities.description')}
			title={t('default:vehicles.detail.VehiclesDetailFunctionalities.title')}
		>
			<Section>
				<Grid columns="a" gap="sm">
					{FUNCTIONALITY_FIELDS.map(fieldName => (
						<StandardFormController
							key={fieldName}
							control={form.control}
							name={fieldName}
							render={({ field }) => (
								<Checkbox
									checked={!!field.value}
									disabled={!capabilities.editEnabled}
									label={t(`default:vehicles.detail.VehiclesDetailFunctionalities.fields.${fieldName}.label`)}
									onChange={event => field.onChange(event.currentTarget.checked)}
								/>
							)}
						/>
					))}
				</Grid>
			</Section>
		</Collapsible>
	);
}
