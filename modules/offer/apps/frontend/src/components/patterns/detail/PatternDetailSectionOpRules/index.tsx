/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { IconEye, IconPlus } from '@tabler/icons-react';
import { Button, Collapsible, Section, Tag } from '@tmlmobilidade/ui';
import { useState } from 'react';

import { RulesListView } from '../../rules/list/RulesListView';
import { RulesScheduleView } from '../../rules/list/RulesScheduleView';

/* * */

export function PatternDetailSectionOpRules() {
	//
	// A. Setup variables
	const patternDetailContext = usePatternDetailContext();
	const [activeView, setActiveView] = useState<'list' | 'schedule'>('list');

	// B. Render components
	return (
		<Collapsible title="Regras de funcionamento" defaultOpen>
			<Section gap="lg">
				{/* Toggle Tags */}
				<Section flexDirection="row" gap="sm" padding="none">
					<Tag
						label="Lista de regras"
						onClick={() => setActiveView('list')}
						variant={activeView === 'list' ? 'primary' : 'muted'}
					/>
					<Tag
						label="Horários"
						onClick={() => setActiveView('schedule')}
						variant={activeView === 'schedule' ? 'primary' : 'muted'}
					/>
				</Section>

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
