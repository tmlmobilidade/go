'use client';

import { useVehiclesAgenciesData } from '@/components/vehicles/shared/use-vehicles-agencies-data';
import { CreateVehicleSchema, VehicleEmissionValues, VehiclePropulsionValues, VehicleTypeValues } from '@tmlmobilidade/go-types-operation';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Checkbox, DateInput, NumberInput, Section, Select, Spacer, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesCreateFormContext } from '../VehiclesCreateForm.context';

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

export function VehiclesCreateInfos() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useVehiclesCreateFormContext();

	const { options: agencyOptions } = useVehiclesAgenciesData();

	//
	// B. Render components

	return (
		<Section gap="md">
			<StandardFormController
				control={form.control}
				name="_id"
				render={({ field, fieldState }) => (
					<NumberInput
						error={fieldState.error?.message}
						label={t('default:vehicles.create.VehiclesCreateInfos.fields._id.label')}
						placeholder={t('default:vehicles.create.VehiclesCreateInfos.fields._id.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ? Number(field.value) : undefined}
						withAsterisk={!CreateVehicleSchema.shape._id.isOptional()}
						onChange={(value) => {
							const next = value?.toString() ?? '';
							field.onChange(next);
							form.setValue('vehicle_id', next);
						}}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="owner"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.owner.label')}
						onChange={e => field.onChange(e.currentTarget.value)}
						placeholder={t('default:vehicles.create.VehiclesCreateInfos.fields.owner.placeholder')}
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
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.agency_id.label')}
						onChange={field.onChange}
						readOnly={!capabilities.editEnabled}
						value={field.value}
						withAsterisk={!CreateVehicleSchema.shape.agency_id.isOptional()}
					/>
				)}
			/>

			<Spacer size="md" />

			<StandardFormController
				control={form.control}
				name="registration_date"
				render={({ field, fieldState }) => (
					<DateInput
						error={fieldState.error?.message}
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.registration_date.label')}
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
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.start_date.label')}
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
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.license_plate.label')}
						maxLength={6}
						onChange={e => field.onChange(e.currentTarget.value.toUpperCase())}
						placeholder={t('default:vehicles.create.VehiclesCreateInfos.fields.license_plate.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						withAsterisk={!CreateVehicleSchema.shape.license_plate.isOptional()}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="make"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.make.label')}
						onChange={e => field.onChange(e.currentTarget.value)}
						placeholder={t('default:vehicles.create.VehiclesCreateInfos.fields.make.placeholder')}
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
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.model.label')}
						onChange={e => field.onChange(e.currentTarget.value)}
						placeholder={t('default:vehicles.create.VehiclesCreateInfos.fields.model.placeholder')}
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
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.available_seats.label')}
						onChange={field.onChange}
						placeholder={t('default:vehicles.create.VehiclesCreateInfos.fields.available_seats.placeholder')}
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
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.available_standing.label')}
						onChange={field.onChange}
						placeholder={t('default:vehicles.create.VehiclesCreateInfos.fields.available_standing.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? undefined}
					/>
				)}
			/>

			<Spacer size="sm" />

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

			<Spacer size="sm" />

			<StandardFormController
				control={form.control}
				name="typology"
				render={({ field, fieldState }) => (
					<Select
						error={fieldState.error?.message}
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.typology.label')}
						onChange={field.onChange}
						placeholder={t('default:vehicles.create.VehiclesCreateInfos.fields.typology.placeholder')}
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
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.propulsion.label')}
						onChange={field.onChange}
						placeholder={t('default:vehicles.create.VehiclesCreateInfos.fields.propulsion.placeholder')}
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
						label={t('default:vehicles.create.VehiclesCreateInfos.fields.emission.label')}
						onChange={field.onChange}
						placeholder={t('default:vehicles.create.VehiclesCreateInfos.fields.emission.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value}
						data={VehicleEmissionValues.map(value => ({
							label: t(`default:vehicles.shared.emission.${value}`),
							value,
						}))}
					/>
				)}
			/>
		</Section>
	);
}
