'use client';

/* * */

import { useVehicleImportContext } from '@/components/Vehicles/import/VehicleImport.context';
import { Button, closeModal, FileUpload, Grid, Section, Spacer, Text } from '@tmlmobilidade/ui';

/* * */

export function VehicleImportFile() {
	//

	//
	// A. Setup variables

	const vehicleImportContext = useVehicleImportContext();

	//
	// B. Render Components

	return (
		<Section gap="md">
			<Text>Selecione o arquivo txt para importar os dados dos veículos.</Text>
			<Spacer size="md" />

			<FileUpload
				accept=".txt,.csv"
				label="Arquivo de importação de veículos"
				maxFileSize={5 * 1024 * 1024 * 1024} // 5 GB
				onFileChange={vehicleImportContext.actions.setImportFile}
			/>

			<Grid columns="ab" gap="md">
				<Button
					disabled={vehicleImportContext.flags.isSaving}
					label="Cancelar"
					onClick={() => closeModal('import-vehicle-modal')}
					variant="secondary"
				/>
				<Button
					disabled={!vehicleImportContext.flags.isSaving}
					label="Criar validação"
					loading={vehicleImportContext.flags.isSaving}
					onClick={vehicleImportContext.actions.createVehicle}
				/>
			</Grid>

		</Section>

	);
}
