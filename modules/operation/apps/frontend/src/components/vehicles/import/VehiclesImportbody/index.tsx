'use client';

import { ImportPreview } from '@/components/common/ImportPreview';
import { useVehiclesImportContext } from '@/components/vehicles/import/VehiclesImport.context';
import { AlertMessage, FileUpload, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function VehiclesImportBody() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const vehiclesImportContext = useVehiclesImportContext();

	//
	// B. Render components

	return (
		<Section gap="md" padding="lg">
			{vehiclesImportContext.flags.error != null && (
				<AlertMessage title={vehiclesImportContext.flags.error?.message ?? t('default:vehicles.import.VehiclesImportFile.unknownError')} variant="danger" />
			)}

			<FileUpload
				accept=".txt"
				label={t('default:vehicles.import.VehiclesImportFile.uploadLabel')}
				maxFileSize={5 * 1024 * 1024 * 1024}
				onFileChange={vehiclesImportContext.actions.setImportFile}
			/>

			<ImportPreview />
		</Section>
	);
}
