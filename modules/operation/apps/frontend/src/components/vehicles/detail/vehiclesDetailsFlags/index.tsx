import { IconEqual, IconEqualNot } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { DeleteButton, Section, Select, StandardFormController, Surface, TextInput, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useVehiclesAgenciesData } from '../../shared/use-vehicles-agencies-data';
import { useVehiclesDetailFormContext } from '../VehiclesDetailForm.context';

export function VehiclesDetailFlags({ index }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useVehiclesDetailFormContext();

	const flagsValues = useStandardFormWatch({ control: form.control, name: 'flags' });

	const { options: agenciesOptions } = useVehiclesAgenciesData({
		permissions: { actions: [PermissionCatalog.all.vehicles.actions.read, PermissionCatalog.all.vehicles.actions.update], scope: PermissionCatalog.all.vehicles.scope },
	});

	const flagIdMatchesVehicleId = useMemo(() => {
		const flagVehicleId = flagsValues?.[index]?.vehicle_id;
		const vehicleId = form.getValues('_id');
		return flagVehicleId === String(vehicleId);
	}, [flagsValues, index, form]);

	//
	// B. handle actions

	const handleDeleteFlagItem = () => {
		const latestValues = form.getValues('flags');
		form.setValue('flags', latestValues?.filter((_, i) => i !== index) ?? [], { shouldDirty: true });
	};

	//
	// C. Render components

	return (
		<Surface variant="bordered">
			<Section alignItems="center" flexDirection="row" gap="sm">
				<Section gap="sm" padding="none">
					<StandardFormController
						control={form.control}
						name={`flags.${index}.agency_ids`}
						render={({ field, fieldState }) => (
							<Select
								data={agenciesOptions}
								disabled={field.disabled || !capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailFlags.fields.agency_ids.label')}
								onChange={values => field.onChange(values)}
								value={field.value?.join(',') ?? ''}
								w="100%"
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name={`flags.${index}.vehicle_id`}
						render={({ field, fieldState }) => (
							<TextInput
								disabled={field.disabled || !capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:vehicles.detail.VehiclesDetailFlags.fields.vehicle_id.label')}
								leftSection={flagIdMatchesVehicleId ? <IconEqual color="var(--color-status-success-primary)" /> : <IconEqualNot color="var(--color-status-danger-primary)" />}
								onChange={event => field.onChange(event.target.value)}
								placeholder={t('default:vehicles.detail.VehiclesDetailFlags.fields.vehicle_id.placeholder')}
								value={field.value ?? ''}
								w="100%"
							/>
						)}
					/>
				</Section>

				<DeleteButton onDelete={handleDeleteFlagItem} />
			</Section>
		</Surface>
	);
}
