'use client';

import { AgencySelect } from '@/components/common/AgencySelect';
import { useVehiclesDetailContext } from '@/contexts/VehiclesDetail.context';
import { DateInput, DeleteButton, Grid, Section, Surface, TextInput } from '@tmlmobilidade/ui';

/* * */

interface VehicleDetailsAgencyHistoryItemProps {
	index: number
}

/* * */

export function VehicleDetailsAgencyHistoryItem({ index }: VehicleDetailsAgencyHistoryItemProps) {
	//

	//
	// A. Setup variables

	const vehiclesDetailContext = useVehiclesDetailContext();

	// B. Handle actions

	const handleDeleteAgencyHistoryItem = () => {
		vehiclesDetailContext.data.form.removeListItem('agency_history', index);
	};

	//
	// C. Render components

	return (
		<Surface variant="bordered">
			<Section gap="md">
				<Grid columns="abc" gap="md">
					<AgencySelect
						label="Operador"
						onChange={vehiclesDetailContext.data.form.getInputProps(`agency_history.${index}.agency_id`).onChange}
						readOnly={vehiclesDetailContext.flags.read_only}
						selected={vehiclesDetailContext.data.form.values.agency_history?.[index]?.agency_id ?? ''}
					/>

					<TextInput
						key={vehiclesDetailContext.data.form.key(`agency_history.${index}.vehicle_id`)}
						label="ID do operador"
						readOnly={vehiclesDetailContext.flags.read_only}
						{...vehiclesDetailContext.data.form.getInputProps(`agency_history.${index}.vehicle_id`)}
					/>

					<DateInput
						key={vehiclesDetailContext.data.form.key(`agency_history.${index}.start_date`)}
						label="Data de início"
						readOnly={vehiclesDetailContext.flags.read_only}
						{...vehiclesDetailContext.data.form.getInputProps(`agency_history.${index}.start_date`)}
					/>
				</Grid>

				{!vehiclesDetailContext.flags.read_only && (
					<Section alignItems="center" flexDirection="row" gap="md" padding="none">
						<DeleteButton onDelete={handleDeleteAgencyHistoryItem} />
					</Section>
				)}
			</Section>
		</Surface>
	);
}
