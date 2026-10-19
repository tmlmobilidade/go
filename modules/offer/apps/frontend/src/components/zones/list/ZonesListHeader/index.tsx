/* * */

import { openCreateZoneModal } from '@/components/zones/create/ZoneCreate.modal';
import { useZonesListContext } from '@/components/zones/list/ZonesList.context';
import { IconFileDownload, IconPlus } from '@tabler/icons-react';
import { Button, ListHeader, SearchField } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function ZonesListHeader() {
	//

	//
	// A. Setup variables

	const zonesListContext = useZonesListContext();
	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<ListHeader
			count={zonesListContext.data.filtered.length}
			search={<SearchField onChange={zonesListContext.filters.search.set} value={zonesListContext.filters.search.value} />}
			title="Zonas"
			actions={(
				<>
					<Button
						disabled={!zonesListContext.flags.canExtract}
						label={t('shared:extractions.versions.offer-zones-v1.export_button')}
						leftSection={<IconFileDownload />}
						onClick={zonesListContext.actions.extract}
					/>
					<Button disabled={!zonesListContext.flags.canCreate} label="Nova Zona" leftSection={<IconPlus />} onClick={openCreateZoneModal} />
				</>
			)}
		/>
	);

	//
}
