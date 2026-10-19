/* * */

import { useAnnotationsListContext } from '@/components/annotations/list/AnnotationsList.context';
import { ListFilter } from '@tmlmobilidade/ui';

/* * */

export function AnnotationsListFilterAgencies() {
	//

	//
	// A. Setup variables

	const annotationsListContext = useAnnotationsListContext();

	//
	// B. Render components

	return (
		<ListFilter
			active={annotationsListContext.filters.agency.isActive}
			label="Operadores"
			onChange={annotationsListContext.filters.agency.set}
			options={annotationsListContext.filters.agency.options}
			isMultiple
			withToggleAll
		/>
	);

	//
}
