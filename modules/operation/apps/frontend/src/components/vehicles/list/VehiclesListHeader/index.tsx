/* * */

import { Label, LoadingActivity, Spacer, Toolbar } from '@tmlmobilidade/ui';
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

	const { isLoading, isValidating, timestamp } = useVehiclesListData();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>{t('default:vehicles.list.VehiclesListHeader.title')}</Label>
			<LoadingActivity isLoading={isLoading} isValidating={isValidating} timestamp={timestamp} />
			<Spacer />
			<VehiclesListFilterSearch />
			<VehiclesListHeaderMenu />
		</Toolbar>
	);
}
