'use client';

import { Button, SeverityTag, Toolbar } from '@tmlmobilidade/ui';

import { useGtfsValidationsDetailResultsContext } from '../GtfsValidationsDetailResults.context';

/* * */

export function GtfsValidationsDetailSelectedRuleHeader() {
	//

	//
	// A. Setup variables

	const { data } = useGtfsValidationsDetailResultsContext();
	// const documentationUrl = getGtfsScheduleDocUrl(selected?.ruleId);

	//
	// B. Render components

	return (
		<Toolbar>
			<SeverityTag severity={data.selected?.result.severity} />
			<Button label="Documentation" onClick={() => null} />
			{/* <Button href={documentationUrl} target="_blank">
				<Icon name="book" />
				{t('gtfs_validations:detail.GtfsValidationsDetailSelectedRuleHeader.documentation')}
			</Button> */}
		</Toolbar>
	);
}
