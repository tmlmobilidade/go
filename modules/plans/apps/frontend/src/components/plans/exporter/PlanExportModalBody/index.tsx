'use client';

import { usePlansListFilterAgency } from '@/components/plans/list/filters/PlansListFilterAgency/use-plans-list-filter-agency';
import { usePlansListData } from '@/components/plans/list/use-plans-list-data';
import { usePlanExportModalContext } from '@/contexts/PlanExport.context';
import { Dates } from '@tmlmobilidade/dates';
import { Divider, Section, Select } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function PlanExportModalBody() {
	//

	//
	// A. Setup variables

	const context = usePlanExportModalContext();
	const plansData = usePlansListData();
	const filterAgency = usePlansListFilterAgency();
	const agencyOptions = filterAgency.options;
	const selectedAgencyId = context.data.agencyId;

	const plansOptions = useMemo(() => plansData.raw
		.filter(plan => plan.agency_id === selectedAgencyId)
		.map((plan) => {
			const startDate = Dates.fromOperationalDate(plan.gtfs_feed_info.feed_start_date, 'Europe/Lisbon').toFormat('dd-MM-yyyy');
			const endDate = Dates.fromOperationalDate(plan.gtfs_feed_info.feed_end_date, 'Europe/Lisbon').toFormat('dd-MM-yyyy');

			return {
				label: `#${plan._id} · ${startDate} - ${endDate}`,
				value: plan._id,
			};
		}), [plansData.raw, selectedAgencyId]);

	//
	// B. Render components

	return (
		<>
			<Divider />

			{agencyOptions.length > 1 && (
				<>
					<Section gap="md">
						<Select
							clearable={false}
							data={agencyOptions}
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
