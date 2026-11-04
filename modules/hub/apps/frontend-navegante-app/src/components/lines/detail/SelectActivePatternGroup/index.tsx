'use client';

import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { SelectPattern } from '@/components/lines/detail/SelectPattern';

/* * */

export function SelectActivePatternGroup() {
	//

	//
	// A. Setup variables

	const linesDetailContext = useLinesDetailContext();

	//
	// B. Render components

	return (
		<SelectPattern
			onChange={linesDetailContext.actions.setActivePattern}
			patterns={linesDetailContext.data.valid_patterns ?? []}
			value={linesDetailContext.data.active_pattern?.version_id || null}
		/>
	);

	//
}
