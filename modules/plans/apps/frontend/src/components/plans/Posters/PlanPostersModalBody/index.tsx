'use client';

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { usePlansExportPdfsContext } from '@/contexts/PlansExportPdfs.context';
import { Dates } from '@tmlmobilidade/dates';
import { Divider, Section, SegmentedControl, Select, Textarea } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

/* * */

type LinesSelectionMode = 'all' | 'exclude' | 'include';

const linesSelectionOptions = [
	{ label: 'Todas as linhas', value: 'all' },
	{ label: 'Apenas estas linhas', value: 'include' },
	{ label: 'Todas exceto estas', value: 'exclude' },
];

/* * */

export function PlanPostersExportModalBody() {
	//

	//
	// A. Setup variables

	const context = usePlansExportPdfsContext();
	const plansListContext = usePlansListContext();
	const [lines, setLines] = useState('');
	const [linesSelectionMode, setLinesSelectionMode] = useState<LinesSelectionMode>('all');

	const plansOptions = useMemo(() => plansListContext.data.raw
		.filter(plan => !!plan.operation_file_id && context.data.agencyOptions.some(option => option.value === plan.agency_id))
		.map((plan) => {
			const startDate = Dates.fromOperationalDate(plan.gtfs_feed_info.feed_start_date, 'Europe/Lisbon').toFormat('dd-MM-yyyy');
			const endDate = Dates.fromOperationalDate(plan.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').toFormat('dd-MM-yyyy');

			return {
				label: `#${plan._id} · ${startDate} - ${endDate}`,
				value: plan._id,
			};
		}), [context.data.agencyOptions, plansListContext.data.raw]);

	//
	// C. Handle actions

	const handleLinesSelectionModeChange = (value: string) => {
		setLinesSelectionMode(value as LinesSelectionMode);
	};

	//
	// D. Render components

	return (
		<>
			<Divider />

			<Section gap="md">
				<Select
					data={plansOptions}
					description="Selecione um plano"
					label="Selecionar plano"
					onChange={context.actions.setPlanId}
					value={context.data.planId}
					w="100%"
				/>
			</Section>
			<Divider />

			{context.data.planId && (
				<Section gap="md">
					<SegmentedControl
						data={linesSelectionOptions}
						description="Escolha quais linhas pretende considerar"
						fullWidth={true}
						label="Linhas"
						onChange={handleLinesSelectionModeChange}
						value={linesSelectionMode}
					/>

					{linesSelectionMode !== 'all' && (
						<Textarea
							description="Separe os códigos das linhas por vírgulas"
							label={linesSelectionMode === 'include' ? 'Linhas a exportar' : 'Linhas a excluir'}
							minRows={3}
							onChange={event => setLines(event.currentTarget.value)}
							placeholder="Ex.: 1001, 1002, 1003"
							value={lines}
						/>
					)}
				</Section>
			)}
		</>
	);

	//
}
