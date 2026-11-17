import { useVehiclesImportContext } from '@/components/vehicles/import/VehiclesImport.context';
import { Divider, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ImportPreview() {
	const { data } = useVehiclesImportContext();
	const { t } = useTranslation();

	if (data.importPreview.length === 0) return null;

	return (
		<Section gap="md">
			<Label>{t('default:vehicles.import.VehiclesImportFile.submit')}: {data.counters.created}</Label>
			<Divider />
		</Section>
	);
}
