'use client';

/* * */

import { useVehicleImportContext } from '@/components/Vehicles/import/VehicleImport.context';
import { Button, closeModal, FileUpload, Grid, Label, Section, Spacer, Text } from '@tmlmobilidade/ui';

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

			<Text>Selecione o arquivo para importar os dados dos veículos.</Text>
			<Spacer size="md" />
			{/*
			{vehicleImportContext.data.form.values._id && (
				<>
					<Section gap="sm">
						<Label size="lg">feed_info.txt</Label>
						<FeedInfoDisplay data={validationsCreateContext.data.form.values.gtfs_feed_info} />
					</Section>
					<Divider />
				</>
			)} */}

			<FileUpload
				accept=".txt"
				label="Arquivo de importação de veículos"
				maxFileSize={5 * 1024 * 1024 * 1024} // 5 GB
				onFileChange={vehicleImportContext.actions.setImportFile}
			/>

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={vehicleImportContext?.flags.isloading}
						label="Cancelar"
						onClick={() => closeModal('import-vehicle-modal')}
						variant="secondary"
					/>
					<Button
						disabled={!vehicleImportContext?.flags.canCreateorUpdate}
						label="Criar veículos"
						loading={vehicleImportContext?.flags.isloading}
						onClick={vehicleImportContext?.actions.createVehicle}
					/>
				</Grid>
			</Section>

		</Section>

	);
}
