import { useVehiclesImportContext } from '@/components/vehicles/import/VehiclesImport.context';
import { Label } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ImportPreview() {
	//

	//
	// A. Setup variables

	const { data } = useVehiclesImportContext();
	const { t } = useTranslation();

	if (data.importPreview.length === 0) return null;

	//
	// B. Render components

	return (
		<>
			<Label size="lg">{t('default:vehicles.import.VehiclesImportFile.submit')}: {data.counters.created}</Label>
		</>
	);
}
