'use client';

import { usePlansListData } from '@/components/plans/list/use-plans-list-data';
import { usePlansExportPdfsContext } from '@/contexts/PlansExportPdfs.context';
import { Dates } from '@tmlmobilidade/dates';
import { type LinesMode } from '@tmlmobilidade/go-types-offer';
import { Divider, MultiSelect, Section, SegmentedControl, Select } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function PlanPostersExportModalBody() {
	//

	//
	// A. Setup variables

	const context = usePlansExportPdfsContext();
	const plansData = usePlansListData();

	const plansOptions = useMemo(() => plansData.raw
		.filter(plan => !!plan.operation_file_id && plan.agency_id === context.data.agencyId)
		.map((plan) => {
			const startDate = Dates.fromOperationalDate(plan.gtfs_feed_info.feed_start_date, 'Europe/Lisbon').toFormat('dd-MM-yyyy');
			const endDate = Dates.fromOperationalDate(plan.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').toFormat('dd-MM-yyyy');

			return {
				label: `#${plan._id} · ${startDate} - ${endDate}`,
				value: plan._id,
			};
		}), [context.data.agencyId, plansData.raw]);

	const linesOptions = useMemo(() => context.data.lines
		.filter(line => line.agency_id === context.data.agencyId)
		.sort((a, b) => a.code.localeCompare(b.code))
		.map(line => ({
			label: `${line.code} - ${line.name}`,
			value: line._id,
		})), [context.data.agencyId, context.data.lines]);

	//
	// D. Render components

	return (
		<>
			<Divider />

			<Section gap="md">
				<Select
					data={context.data.agencyOptions}
					description="As linhas e os planos são apresentados para este operador"
					label="Selecionar operador"
					onChange={context.actions.setAgencyId}
					value={context.data.agencyId}
					w="100%"
				/>
			</Section>
			<Divider />

			<Section gap="md">
				<Select
					data={plansOptions}
					description="Selecione um plano"
					disabled={!context.data.agencyId}
					label="Selecionar plano"
					onChange={context.actions.setPlanId}
					value={context.data.planId}
					w="100%"
				/>
			</Section>
			<Divider />

			{context.data.agencyId && (
				<Section gap="md">
					<SegmentedControl
						fullWidth={true}
						label="Linhas a exportar"
						onChange={value => context.actions.setLinesMode(value as LinesMode)}
						value={context.data.linesMode}
						data={[
							{ label: 'Todas as linhas', value: 'all' },
							{ label: 'Apenas estas linhas', value: 'include' },
							{ label: 'Todas exceto estas', value: 'exclude' },
						]}
					/>

					{context.data.linesMode === 'include' && (
						<MultiSelect
							key={`${context.data.agencyId}-${context.data.linesMode}`}
							data={linesOptions}
							description="Apenas estas linhas serão exportadas."
							onChange={context.actions.setLineIds}
							placeholder="Selecionar linhas"
							value={context.data.lineIds}
							w="100%"
						/>
					)}

					{context.data.linesMode === 'exclude' && (
						<MultiSelect
							key={`${context.data.agencyId}-${context.data.linesMode}`}
							data={linesOptions}
							description="Todas as linhas serão exportadas, exceto estas."
							onChange={context.actions.setLineIds}
							placeholder="Selecionar linhas"
							value={context.data.lineIds}
							w="100%"
						/>
					)}

				</Section>
			)}
		</>
	);

	//
}
