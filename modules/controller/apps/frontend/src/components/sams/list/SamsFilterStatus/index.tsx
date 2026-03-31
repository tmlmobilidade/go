/* * */

import { useSamsListContext } from '@/contexts/SamsList.context';

import { FilterTypeList } from '@tmlmobilidade/ui';

/* * */

export function SamsFilterStatus() {

    //
    // A. Setup variables

    const samsListContext = useSamsListContext();

    //
    // B. Render components

	return (
		<FilterTypeList
			active={true}
			label="Estado"
			onChange={() => {}}
			options={[]}
			withToggleAll
		/>
	);
}