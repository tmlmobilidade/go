/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { RulesListView } from '@/components/patterns/rules/list/RulesListView';
import { RulesScheduleView } from '@/components/patterns/rules/list/RulesScheduleView';
import { IconEye, IconPlus } from '@tabler/icons-react';
import { Button, Collapsible, Section, SegmentedControl } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function PatternDetailSectionRules() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const patternDetailContext = usePatternDetailContext();
	const [activeView, setActiveView] = useState('list');

	//
	// B. Render components

	return (
		<Collapsible title={t('patterns:detail.PatternDetailSectionRules.operating_rules')} defaultOpen>
			<Section gap="lg">
				{/* View selection */}
				<SegmentedControl
					onChange={setActiveView}
					value={activeView}
					data={[
						{ label: t('patterns:detail.PatternDetailSectionRules.rule_list'), value: 'list' },
						{ label: t('patterns:detail.PatternDetailSectionRules.schedules'), value: 'schedule' },
					]}
				/>

				{/* Conditional Views */}
				{activeView === 'list' && <RulesListView />}
				{activeView === 'schedule' && <RulesScheduleView />}

				{/* Actions */}
				<Section flexDirection="row" gap="sm" padding="none">
					<Button
						disabled={!patternDetailContext.capabilities.editEnabled}
						label={t('patterns:detail.PatternDetailSectionRules.new_rule')}
						leftSection={<IconPlus size={16} />}
						onClick={() => patternDetailContext.actions.openRuleModal()}
					/>

					<Button
						label={t('patterns:detail.PatternDetailSectionRules.preview_calendar')}
						leftSection={<IconEye size={16} />}
						onClick={patternDetailContext.actions.openRulesCalendarPreviewModal}
						variant="secondary"
					/>
				</Section>
			</Section>
		</Collapsible>
	);
}
