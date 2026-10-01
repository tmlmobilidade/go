'use client';

import { useVehiclesAgenciesData } from '@/components/vehicles/shared/use-vehicles-agencies-data';
import { CreateVehicleSchema } from '@tmlmobilidade/go-types-operation';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Collapsible, DateInput, Grid, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesDetailFormContext } from '../VehiclesDetailForm.context';

/* * */

export function VehiclesDetailIdentification() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useVehiclesDetailFormContext();

	const { options: agencyOptions } = useVehiclesAgenciesData();

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
						name="owner"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailIdentification.fields.owner.label')}
								onChange={e => field.onChange(e.currentTarget.value)}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
								withAsterisk={!CreateVehicleSchema.shape.owner.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="agency_id"
						render={({ field, fieldState }) => (
							<Select
								data={agencyOptions}
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailIdentification.fields.agency_id.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
								withAsterisk={!CreateVehicleSchema.shape.agency_id.isOptional()}
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
					<StandardFormController
						control={form.control}
						name="start_date"
						render={({ field, fieldState }) => (
							<DateInput
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailIdentification.fields.start_date.label')}
								onChange={value => field.onChange(value != null ? String(value) : value)}
								readOnly={!capabilities.editEnabled}
								value={field.value != null ? Number(field.value) as OperationalDateInt : null}
								withAsterisk={!CreateVehicleSchema.shape.start_date.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="license_plate"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailIdentification.fields.license_plate.label')}
								onChange={e => field.onChange(e.currentTarget.value.toUpperCase())}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
								withAsterisk={!CreateVehicleSchema.shape.license_plate.isOptional()}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
