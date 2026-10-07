'use client';

import { ImportPreview } from '@/components/common/ImportPreview';
import { useVehiclesImportContext } from '@/components/vehicles/import/VehiclesImport.context';
import { closeVehiclesImportModal } from '@/components/vehicles/import/VehiclesImport.modal';
import { AlertMessage, Button, Divider, FileUpload, Grid, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function VehiclesImportFile() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const vehiclesImportContext = useVehiclesImportContext();

	//
	// B. Render components

	return (
		<Section gap="lg">
			{vehiclesImportContext.flags.error != null && (
				<>
					<AlertMessage title={vehiclesImportContext.flags.error?.message ?? t('default:vehicles.import.VehiclesImportFile.unknownError')} variant="danger" />
					<Divider />
				</>
			)}

			{vehiclesImportContext.data.importPreview && vehiclesImportContext.actions.setImportFile && (
				<ImportPreview />
			)}

			<Label>{t('default:vehicles.import.VehiclesImportFile.fileLabel')}</Label>
			<FileUpload
				accept=".txt"
				label={t('default:vehicles.import.VehiclesImportFile.uploadLabel')}
				maxFileSize={5 * 1024 * 1024 * 1024}
				onFileChange={vehiclesImportContext.actions.setImportFile}
			/>

			<Section>
				<Grid columns="ab" gap="md">
					<Button
						disabled={vehiclesImportContext.flags.isLoading}
						label={t('default:vehicles.import.VehiclesImportFile.cancel')}
						onClick={closeVehiclesImportModal}
						variant="secondary"
					/>
					<Button
						disabled={vehiclesImportContext.flags.error != null}
						label={t('default:vehicles.import.VehiclesImportFile.submit')}
						loading={vehiclesImportContext.flags.isLoading || vehiclesImportContext.flags.isSaving}
						onClick={vehiclesImportContext.actions.createVehicle}
					/>
				</Grid>
			</Section>
		</Section>
	);
}
