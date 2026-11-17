'use client';

import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Collapsible, DateInput, Grid, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesDetailFormContext } from '../VehiclesDetailForm.context';

/* * */

export function VehiclesDetailIdentification() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useVehiclesDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:vehicles.detail.VehiclesDetailIdentification.description')}
			title={t('default:vehicles.detail.VehiclesDetailIdentification.title')}
		>
			<Section>
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={form.control}
						name="_id"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailIdentification.fields._id.label')}
								onChange={field.onChange}
								value={field.value ?? ''}
								readOnly
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="registration_date"
						render={({ field, fieldState }) => (
							<DateInput
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailIdentification.fields.registration_date.label')}
								onChange={value => field.onChange(value != null ? String(value) : value)}
								readOnly={!capabilities.editEnabled}
								value={field.value != null ? Number(field.value) as OperationalDateInt : null}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
