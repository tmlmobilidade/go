/* * */

import { Tag } from '@tmlmobilidade/ui';

import { useVehiclesAgenciesData } from '../../../shared/use-vehicles-agencies-data';

/* * */

export function VehiclesListCellAgency({ value }: { value: string }) {
	//

	//
	// A. Setup variables

	const { options } = useVehiclesAgenciesData();

	const label = options.find(option => option.value === value)?.label ?? value;

	//
	// B. Render components

	return <Tag label={label} />;
}
