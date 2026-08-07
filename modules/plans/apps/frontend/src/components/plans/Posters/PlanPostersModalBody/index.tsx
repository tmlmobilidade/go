'use client';

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { usePlansExportPdfsContext } from '@/contexts/PlansExportPdfs.context';
import { Dates } from '@tmlmobilidade/dates';
import { Divider, Section, SegmentedControl, Select, Textarea } from '@tmlmobilidade/ui';
import { useMemo, useState } from 'react';

/* * */

type StopsSelectionMode = 'all' | 'exclude' | 'include';

const stopsSelectionOptions = [
	{ label: 'Todas as paragens', value: 'all' },
	{ label: 'Apenas estas paragens', value: 'include' },
	{ label: 'Todas exceto estas', value: 'exclude' },
];

/* * */

export function PlanPostersExportModalBody() {
	//

	//
	// A. Setup variables

	const context = usePlansExportPdfsContext();
	const plansListContext = usePlansListContext();
	const [stops, setStops] = useState('');
	const [stopsSelectionMode, setStopsSelectionMode] = useState<StopsSelectionMode>('all');

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

	const handleStopsSelectionModeChange = (value: string) => {
		setStopsSelectionMode(value as StopsSelectionMode);
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
						data={stopsSelectionOptions}
						description="Escolha quais paragens pretende considerar"
						fullWidth={true}
						label="Paragens"
						onChange={handleStopsSelectionModeChange}
						value={stopsSelectionMode}
					/>

					{stopsSelectionMode !== 'all' && (
						<Textarea
							description="Separe os códigos das paragens por vírgulas"
							label={stopsSelectionMode === 'include' ? 'Paragens a exportar' : 'Paragens a excluir'}
							minRows={3}
							onChange={event => setStops(event.currentTarget.value)}
							placeholder="Ex.: 10001, 10002, 10003"
							value={stops}
						/>
					)}
				</Section>
			)}
		</>
	);

	//
}
