'use client';

/* * */

import { AgencyMultiselect } from '@/components/common/AgencyMultiselect';
import { DatesSelector } from '@/components/common/DatesSelector';
import { VehiclesDetailHeader } from '@/components/Vehicles/detail/VehiclesDetailHeader';
import { useVehiclesDetailContext } from '@/contexts/VehiclesDetail.context';
import { vehicleSchema } from '@tmlmobilidade/types';
import { ErrorDisplay, Grid, LoadingOverlay, Pane, Section, Text, Textarea, TextInput } from '@tmlmobilidade/ui';

/* * */

export function VehiclesDetail() {
	//

	//
	// A. Setup variables

	const VehiclesDetailContext = useVehiclesDetailContext();

	//
	// B. Render components

	if (VehiclesDetailContext.flags.loading) {
		return <LoadingOverlay />;
	}

	if (VehiclesDetailContext.flags.error) {
		return <ErrorDisplay message={VehiclesDetailContext.flags.error.message} />;
	}

	return (
		<Pane header={[<VehiclesDetailHeader />]}>
			<Section>
				<Grid columns="a" gap="lg">

					<TextInput
						label="Título"
						placeholder="Ex: Greve de transportes"
						readOnly={VehiclesDetailContext.flags.read_only}
						required={!vehicleSchema.shape..isOptional()}
						w="100%"
						{...vehiclesDetailContext.data.form.getInputProps('title')}
					/>

					<Textarea
						label="Descrição"
						placeholder="Descrição da ocorrência"
						readOnly={VehiclesDetailContext.flags.read_only}
						required={!vehicleSchema.shape..isOptional()}
						w="100%"
						{...vehiclesDetailContext.data.form.getInputProps('description')}
					/>

					<AgencyMultiselect
						label="Operadores afetados"
						readOnly={vehiclesDetailContext.flags.read_only}
						selected={vehiclesDetailContext.data.form.values.agency_ids || []}
						{...vehiclesDetailContext.data.form.getInputProps('agency_ids')}
					/>

					<Text>Selecione as datas da ocorrência</Text>
					<DatesSelector />

				</Grid>
			</Section>
		</Pane>
	);

	//
}
