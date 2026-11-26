'use client';

import { IdTag, SeverityTag, Toolbar } from '@tmlmobilidade/ui';

import { useGtfsValidationsDetailResultsContext } from '../GtfsValidationsDetailResults.context';

/* * */

export function GtfsValidationsDetailSelectedRuleHeader() {
	//

	//
	// A. Setup variables

	const { data } = useGtfsValidationsDetailResultsContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<SeverityTag severity={data.selected?.result.severity} />
			<IdTag id={data.selected?.ruleId} copyOnClick />
		</Toolbar>
	);
}
