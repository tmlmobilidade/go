/* * */

import { ListHeader, LoadingActivity } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { VehiclesListFilterSearch } from '../filters/VehiclesListFilterSearch';
import { useVehiclesListData } from '../use-vehicles-list-data';
import { VehiclesListHeaderMenu } from '../VehiclesListHeaderMenu';

/* * */

export function VehiclesListHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data, isLoading, isValidating, timestamp } = useVehiclesListData();

	//
	// B. Render components

	return (
		<ListHeader
			actions={<VehiclesListHeaderMenu />}
			activity={<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />}
			count={data?.length}
			search={<VehiclesListFilterSearch />}
			title={t('default:vehicles.list.VehiclesListHeader.title')}
		/>
	);
}
