'use client';

/* * */

import { DatesSelector } from '@/components/common/DatesSelector';
import { VehiclesDetailHeader } from '@/components/Vehicles/detail/VehiclesDetailHeader';
import { useVehiclesDetailContext } from '@/contexts/VehiclesDetail.context';
// import { vehicleSchema } from '@tmlmobilidade/types';
import { ErrorDisplay, Grid, LoadingOverlay, Pane, Section, Select, Text, Textarea, TextInput } from '@tmlmobilidade/ui';

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
						// required={!vehicleSchema.shape..isOptional()}
						w="100%"
						{...VehiclesDetailContext.data.form.getInputProps('title')}
					/>

					<Textarea
						label="Descrição"
						placeholder="Descrição da ocorrência"
						readOnly={VehiclesDetailContext.flags.read_only}
						// required={!vehicleSchema.shape..isOptional()}
						w="100%"
						{...VehiclesDetailContext.data.form.getInputProps('description')}
					/>

					<Select
						label="Operadores afetados"
						placeholder="Selecione os operadores"
						readOnly={VehiclesDetailContext.flags.read_only}
						{...VehiclesDetailContext.data.form.getInputProps('agency_id')}
					/>

					<Text>Selecione as datas da ocorrência</Text>
					<DatesSelector />

				</Grid>
			</Section>
		</Pane>
	);

	//
}
