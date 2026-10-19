'use client';

import { CreateVehicleSchema, VehicleEmissionValues, VehiclePropulsionValues, VehicleTypeValues } from '@tmlmobilidade/go-types-operation';
import { Collapsible, Grid, NumberInput, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesDetailFormContext } from '../VehiclesDetailForm.context';

/* * */

export function VehiclesDetailSpecifications() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useVehiclesDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:vehicles.detail.VehiclesDetailSpecifications.description')}
			title={t('default:vehicles.detail.VehiclesDetailSpecifications.title')}
		>
			<Section>
				<Grid columns="ab" gap="md">
					<StandardFormController
						control={form.control}
						name="make"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailSpecifications.fields.make.label')}
								onChange={e => field.onChange(e.currentTarget.value)}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
								withAsterisk={!CreateVehicleSchema.shape.make.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="model"
						render={({ field, fieldState }) => (
							<TextInput
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailSpecifications.fields.model.label')}
								onChange={e => field.onChange(e.currentTarget.value)}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? ''}
								withAsterisk={!CreateVehicleSchema.shape.model.isOptional()}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="available_seats"
						render={({ field, fieldState }) => (
							<NumberInput
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailSpecifications.fields.available_seats.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? undefined}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="available_standing"
						render={({ field, fieldState }) => (
							<NumberInput
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailSpecifications.fields.available_standing.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value ?? undefined}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="typology"
						render={({ field, fieldState }) => (
							<Select
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailSpecifications.fields.typology.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
								data={VehicleTypeValues.map(value => ({
									label: t(`default:vehicles.shared.typology.${value}`),
									value,
								}))}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="propulsion"
						render={({ field, fieldState }) => (
							<Select
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailSpecifications.fields.propulsion.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
								data={VehiclePropulsionValues.map(value => ({
									label: t(`default:vehicles.shared.propulsion.${value}`),
									value,
								}))}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="emission"
						render={({ field, fieldState }) => (
							<Select
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailSpecifications.fields.emission.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
								data={VehicleEmissionValues.map(value => ({
									label: t(`default:vehicles.shared.emission.${value}`),
									value,
								}))}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
