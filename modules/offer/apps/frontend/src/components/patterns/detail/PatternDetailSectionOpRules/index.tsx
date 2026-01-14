/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { IconPlus } from '@tabler/icons-react';
import { Button, Collapsible, Section } from '@tmlmobilidade/ui';

import { openCreateRuleModal } from '../../rules/create/RuleCreate.modal';
import PatternDetailRules from '../../rules/list/Rules';

/* * */

export function PatternDetailSectionOpRules() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();

	//
	// B. Handle actions

	const handleOpenCreateModal = () => {
		openCreateRuleModal(patternDetailContext.data.agency_id);
	};

	const handleOpenEditModal = (rule) => {
		// openScheduleRuleModal({
		// 	onSuccess: () => {
		// 		// TODO: Refresh rules list when backend is ready
		// 		console.log('Rule updated, refreshing list...');
		// 	},
		// 	patternId: patternDetailContext.data.id,
		// 	rule,
		// });
	};

	//
	// C. Render components

	return (
		<Collapsible title="Regras de funcionamento" defaultOpen>
			<Section gap="sm">
				{/* Example Rules - TODO: Replace with actual data from backend */}
				<PatternDetailRules
					onDelete={() => console.log('Delete Rule 1')}
					onEdit={() => handleOpenEditModal({
						_id: 'rule1',
						events: [],
						holidays: undefined,
						isOffTime: false,
						periodIds: ['escolar'],
						weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
					})}
					ruleData={{
						isOffTime: false, // Add rule
						name: 'Dias úteis durante o período escolar',
						times: ['06:20', '07:00', '07:45'],
						travelTime: 'Base',
					}}
				/>

				<PatternDetailRules
					onDelete={() => console.log('Delete Rule 2')}
					onEdit={() => handleOpenEditModal({
						_id: 'rule2',
						events: [],
						holidays: undefined,
						isOffTime: false,
						periodIds: ['ferias_verao'],
						weekdays: ['Sat', 'Sun'],
					})}
					ruleData={{
						isOffTime: false, // Add rule
						name: 'Fins de semana - Serviço da manhã',
						times: ['08:00', '09:00', '10:00'],
						travelTime: 'Base + 5 min',
					}}
				/>

				<PatternDetailRules
					onDelete={() => console.log('Delete Rule 3')}
					onEdit={() => handleOpenEditModal({
						_id: 'rule3',
						events: [],
						holidays: { all: true },
						isOffTime: true,
						periodIds: ['escolar', 'ferias_verao'],
					})}
					ruleData={{
						isOffTime: true, // Remove rule
						name: 'Feriados nacionais',
						times: ['06:20', '07:45'],
						travelTime: 'Base',
					}}
				/>

				{/* Create Button */}
				<Button
					label="Nova regra"
					leftSection={<IconPlus size={16} />}
					onClick={handleOpenCreateModal}
				/>
			</Section>

		</Collapsible>
	);

	//
}
