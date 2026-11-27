'use client';

import { NoDataLabel, Pane, Section, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useGtfsValidationsDetailResultsContext } from '../GtfsValidationsDetailResults.context';
import { GtfsValidationsDetailSelectedRuleHeader } from '../GtfsValidationsDetailSelectedRuleHeader';
import { GtfsValidationsDetailSelectedRuleMessages } from '../GtfsValidationsDetailSelectedRuleMessages';

/* * */

export function GtfsValidationsDetailSelectedRule() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { data } = useGtfsValidationsDetailResultsContext();
	// const documentationUrl = getGtfsScheduleDocUrl(selected?.ruleId);

	//
	// B. Render components

	if (!data.selected) {
		return (
			<Section alignItems="center" height="100%" justifyContent="center">
				<NoDataLabel text={t('gtfs_validations:detail.GtfsValidationsDetailSelectedRule.no_rule_selected')} />
			</Section>
		);
	}

	return (
		<Pane header={[
			<GtfsValidationsDetailSelectedRuleHeader key="header" />,
		]}
		>
			<Section gap="sm">
				<Text>{data.selected.description}</Text>
				<GtfsValidationsDetailSelectedRuleMessages
					description={data.selected.description}
					messages={data.selected.result.messages}
					ruleId={data.selected.ruleId}
				/>
			</Section>
		</Pane>
	);
}
