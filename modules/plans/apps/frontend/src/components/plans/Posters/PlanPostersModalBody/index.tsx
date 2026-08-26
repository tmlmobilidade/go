'use client';

import { usePlansExportPdfsContext } from '@/contexts/PlansExportPdfs.context';
import { Dates } from '@tmlmobilidade/dates';
import { type LinesMode } from '@tmlmobilidade/go-types-offer';
import { Divider, MultiSelect, Section, SegmentedControl, Select } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

const canvasProfileOptions = [
	{ label: '0Master.A', value: '0Master.A' },
	{ label: '0Master.B', value: '0Master.B' },
	{ label: '0Master.C', value: '0Master.C' },
	{ label: '0Master.F', value: '0Master.F' },
];

/* * */

export function PlanPostersExportModalBody() {
	//

	//
	// A. Setup variables

	const context = usePlansExportPdfsContext();

	const plansOptions = useMemo(() => context.data.plans
		.filter(plan => !!plan.operation_file_id && plan.agency_id === context.data.agencyId)
		.map((plan) => {
			const startDate = Dates.fromOperationalDate(plan.gtfs_feed_info.feed_start_date, 'Europe/Lisbon').toFormat('dd-MM-yyyy');
			const endDate = Dates.fromOperationalDate(plan.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').toFormat('dd-MM-yyyy');

			return {
				label: `#${plan._id} · ${startDate} - ${endDate}`,
				value: plan._id,
			};
		}), [context.data.agencyId, context.data.plans]);

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
							data={context.data.lineOptions}
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
							data={context.data.lineOptions}
							description="Todas as linhas serão exportadas, exceto estas."
							onChange={context.actions.setLineIds}
							placeholder="Selecionar linhas"
							value={context.data.lineIds}
							w="100%"
						/>
					)}

					{context.data.linesMode !== 'all' && (
						<Select
							data={canvasProfileOptions}
							description="Este perfil será aplicado às paragens das linhas selecionadas"
							label="Canvas profile"
							onChange={value => context.actions.setCanvasProfile(value as typeof context.data.canvasProfile)}
							value={context.data.canvasProfile}
							w="100%"
						/>
					)}

				</Section>
			)}
		</>
	);

	//
}
