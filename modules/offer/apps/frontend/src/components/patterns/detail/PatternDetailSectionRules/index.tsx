/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { RulesListView } from '@/components/patterns/rules/list/RulesListView';
import { RulesScheduleView } from '@/components/patterns/rules/list/RulesScheduleView';
import { IconEye, IconPlus } from '@tabler/icons-react';
import { Button, Collapsible, Section, SegmentedControl } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

export function PatternDetailSectionRules() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();
	const [activeView, setActiveView] = useState('list');

	//
	// B. Render components

	return (
		<Collapsible title="Regras de funcionamento" defaultOpen>
			<Section gap="lg">
				{/* View selection */}
				<SegmentedControl
					onChange={setActiveView}
					value={activeView}
					data={[
						{ label: 'Lista de regras', value: 'list' },
						{ label: 'Horários', value: 'schedule' },
					]}
				/>

				{/* Conditional Views */}
				{activeView === 'list' && <RulesListView />}
				{activeView === 'schedule' && <RulesScheduleView />}

				{/* Actions */}
				<Section flexDirection="row" gap="sm" padding="none">
					<Button
						label="Nova regra"
						leftSection={<IconPlus size={16} />}
						onClick={() => patternDetailContext.actions.openRuleModal()}
					/>

					<Button
						label="Prever calendário"
						leftSection={<IconEye size={16} />}
						onClick={patternDetailContext.actions.openRulesCalendarPreviewModal}
						variant="secondary"
					/>
				</Section>
			</Section>
		</Collapsible>
	);
}
