'use client';

import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Button, Collapsible, DateInput, Grid, Section, StandardFormController, TextInput, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useVehiclesDetailFormContext } from '../VehiclesDetailForm.context';
import { VehiclesDetailFlags } from '../vehiclesDetailsFlags';

/* * */

export function VehiclesDetailIdentification() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useVehiclesDetailFormContext();

	const flagsValues = useStandardFormWatch({ control: form.control, name: 'flags' });

	const handleAddFlag = () => {
		const latestValues = form.getValues('flags');
		const newValues = [...(latestValues ?? []), {
			agency_ids: [],
			vehicle_id: '',
		}];
		form.setValue('flags', newValues, { shouldDirty: true });
	};

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

			<Section gap="md">
				{flagsValues?.map((_, index) => (
					<VehiclesDetailFlags key={`flag-${index}`} index={index} />
				))}

				<Button label={t('default:vehicles.detail.VehiclesDetailIdentification.add_flag_button.label')} onClick={handleAddFlag} />

			</Section>

		</Collapsible>
	);
}
