'use client';

import { usePlansListContext } from '@/components/plans/list/PlansList.context';
import { useGtfsExportModalContext } from '@/contexts/GtfsExport.context';
import { Divider, Section, Select } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function GtfsExportModalBody() {
	//

	//
	// A. Setup variables

	const context = useGtfsExportModalContext();
	const plansListContext = usePlansListContext();
	const agencyOptions = plansListContext.filters.agency.options;
	const selectedAgencyId = context.data.form.values.agency_ids[0];

	const plansOptions = useMemo(() => plansListContext.data.raw
		.filter(plan => plan.agency_id === selectedAgencyId)
		.map(plan => ({
			label: `#${plan._id} · ${plan.gtfs_feed_info.feed_start_date} - ${plan.gtfs_feed_info.feed_end_date}`,
			value: plan._id,
		})), [plansListContext.data.raw, selectedAgencyId]);

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
							value={context.data.form.values.plan_ids[0] ?? null}
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
