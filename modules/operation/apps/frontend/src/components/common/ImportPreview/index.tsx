import { useVehiclesImportContext } from '@/components/vehicles/import/VehiclesImport.context';
import { IconBus } from '@tabler/icons-react';
import { AlertMessage, Label } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function ImportPreview() {
	//

	//
	// A. Setup variables

	const { data } = useVehiclesImportContext();
	const { t } = useTranslation('default', { keyPrefix: 'vehicles.import.ImportPreview' });
	const createCount = data.counters.created;

	const duplicateCodes = [...new Set(data.importPreview.filter(item => item.mode === 'DUPLICATE').map(item => item.vehicle._id))];

	if (data.importPreview.length === 0) return null;

	//
	// B. Render components

	return (
		<>
			<div aria-live="polite" className={styles.summary} data-empty={createCount === 0}>
				<div aria-hidden="true" className={styles.icon}>
					<IconBus size={28} />
				</div>
				<div className={styles.content}>
					<Label size="lg">{createCount === 0 ? t('nothing_to_create') : t('will_create', { count: createCount })}</Label>
					<Label size="sm">{createCount === 0 ? t('nothing_description') : t('description')}</Label>
				</div>
			</div>

			{duplicateCodes.length > 0 && (
				<AlertMessage title={t('duplicate_rows', { vehicle_codes: duplicateCodes.join(', ') })} variant="muted" />
			)}
		</>
	);
}
