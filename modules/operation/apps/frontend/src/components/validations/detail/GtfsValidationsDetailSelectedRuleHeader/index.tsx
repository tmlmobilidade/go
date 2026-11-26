'use client';

import { CloseButton, IdTag, SeverityTag, Toolbar } from '@tmlmobilidade/ui';

import { useGtfsValidationsDetailResultsContext } from '../GtfsValidationsDetailResults.context';

/* * */

export function GtfsValidationsDetailSelectedRuleHeader() {
	//

	//
	// A. Setup variables

	const { actions, data } = useGtfsValidationsDetailResultsContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={() => actions.select(null)} type="close" />
			<SeverityTag severity={data.selected?.result.severity} />
			<IdTag id={data.selected?.ruleId} copyOnClick />
		</Toolbar>
	);
}
