/* * */

import { Tag, useAgenciesData } from '@tmlmobilidade/ui';

/* * */

export function VehiclesListCellAgency({ value }: { value: string }) {
	//

	//
	// A. Setup variables

	const { options } = useAgenciesData();

	const label = options.find(option => option.value === value)?.label ?? value;

	//
	// B. Render components

	return <Tag label={label} />;
}
