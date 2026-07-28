'use client';

/* * */

import { CmCompliance } from '@/agencies/cm/CmCompliance';
import { CM_AGENCIES } from '@/agencies/cm/constants';
import { ServiceFailuresCard } from '@/cards/ServiceFailuresCard';
import { MetricGrid } from '@/components/MetricGrid';
import { useVideowallMetricsContext } from '@/contexts/VideowallMetrics.context';

import styles from './styles.module.css';

/* * */

export function ServiceFailuresPanel() {
	//

	//
	// A. Setup variables

	const { data, flags } = useVideowallMetricsContext();
	const timestamp = data.metrics?.meta.service.generated_at;

	//
	// B. Render components

	return (
		<section className={styles.container}>
			<MetricGrid layout="primaryWithFourDetails">
				<ServiceFailuresCard
					agencyLabel="CM"
					isLoading={flags.is_loading}
					isValidating={flags.is_validating}
					size="lg"
					timestamp={timestamp}
					value={data.metrics?.total.service}
				/>

				{CM_AGENCIES.map(agency => (
					<ServiceFailuresCard
						key={agency.agency_id}
						agencyLabel={agency.label}
						isLoading={flags.is_loading}
						isValidating={flags.is_validating}
						size="md"
						timestamp={timestamp}
						value={data.agency_metrics[agency.agency_id]?.service}
					/>
				))}
			</MetricGrid>

			<CmCompliance />
		</section>
	);

	//
}
