'use client';

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { usePlansExportPdfsContext } from '@/contexts/PlansExportPdfs.context';
import { Dates } from '@tmlmobilidade/dates';
import { Divider, Section, Select } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function PlanPostersExportModalBody() {
	//

	//
	// A. Setup variables

	const context = usePlansExportPdfsContext();
	const plansListContext = usePlansListContext();
	const selectedAgencyId = context.data.agencyId;

	const plansOptions = useMemo(() => plansListContext.data.raw
		.filter(plan => plan.agency_id === selectedAgencyId && !!plan.operation_file_id)
		.map((plan) => {
			const startDate = Dates.fromOperationalDate(plan.gtfs_feed_info.feed_start_date, 'Europe/Lisbon').toFormat('dd-MM-yyyy');
			const endDate = Dates.fromOperationalDate(plan.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').toFormat('dd-MM-yyyy');

			return {
				label: `#${plan._id} · ${startDate} - ${endDate}`,
				value: plan._id,
			};
		}), [plansListContext.data.raw, selectedAgencyId]);

	//
	// B. Render components

	return (
		<>
			<Divider />

			{context.data.agencyOptions.length > 1 && (
				<>
					<Section gap="md">
						<Select
							clearable={false}
							data={context.data.agencyOptions}
							label="Selecionar operador"
							onChange={context.actions.setAgencyId}
							value={selectedAgencyId ?? null}
							w="100%"
						/>
					</Section>
					<Divider />
				</>
			)}

			{selectedAgencyId && (
				<>
					<Section gap="md">
						<Select
							data={plansOptions}
							description="Selecione um plano deste operador"
							label="Selecionar plano"
							onChange={context.actions.setPlanId}
							value={context.data.planId}
							w="100%"
						/>
					</Section>
					<Divider />
				</>
			)}
		</>
	);

	//
}
