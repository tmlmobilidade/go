// /* * */

// import { useStopListContext } from '@/contexts/StopList.context';
// import { Translations } from '@/lib/translations';
// import {  '@tmlmobilidade/types';
// import { FilterMenu } from '@tmlmobilidade/ui';
// import { useMemo } from 'react';

// /* * */

// export function StopListFilterArea() {
// 	//

// 	//
// 	// A. Setup variables

// 	const stopListContext = useStopListContext();

// 	//
// 	// B. Transform data

// 	const isActive = useMemo(() => {
// 		const defaultValues = Array.from() as string[];
// 		const enabledValues = stopListContext.filters;

// 		if (defaultValues.length !== enabledValues.length) return true;

// 		return !defaultValues.every(item => enabledValues.includes(item));
// 	}, [stopListContext.filters]);

// 	/* * */

// 	const parsedOptions = useMemo(() => {
// 		if(!) return [];
// 	})

// 	//
// 	// C. Render components

// 	return (
// 		<FilterMenu
// 			active={isActive}
// 			label=""
// 			onChange={stopListContext.actions.}
// 			options={parsedOptions}
// 			withToggleAll
// 		/>
// 	);

// 	//
// }
