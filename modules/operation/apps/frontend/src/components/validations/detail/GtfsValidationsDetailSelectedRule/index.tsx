'use client';

import { Pane, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useGtfsValidationsDetailResultsContext } from '../GtfsValidationsDetailResults.context';
import { GtfsValidationsDetailSelectedRuleHeader } from '../GtfsValidationsDetailSelectedRuleHeader';
import { ValidationsDetailResultMessages } from '../ValidationsDetailResultMessages';

/* * */

export function GtfsValidationsDetailSelectedRule() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data: { selected } } = useGtfsValidationsDetailResultsContext();
	// const documentationUrl = getGtfsScheduleDocUrl(selected?.ruleId);

	//
	// B. Render components

	return (
		<Pane header={[
			<GtfsValidationsDetailSelectedRuleHeader key="header" />,
		]}
		>
			{selected && (
				<Section gap="sm">
					<ValueDisplay
						label={t('gtfs_validations:detail.GtfsValidationsDetailSelectedRule.rule_description')}
						value={selected.description}
					/>
					<ValidationsDetailResultMessages
						description={selected.description}
						messages={selected.result.messages}
						ruleId={selected.ruleId}
					/>
				</Section>
			)}
		</Pane>
	);
}
