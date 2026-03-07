import { type TaskProps } from '@/types.js';
import { yyyymmddToDashed } from '@/utils/dates-helper.js';
import { metrics } from '@tmlmobilidade/interfaces';

/* * */

export interface SupplyMetricResult {
	agencyId: string
	date: string
	vkmsobserved: number
	vkmsobservedpct: number
	vkmsscheduled: number
}

/* * */

// Explicit type for each day of the supply metric
interface SupplyDayData {
	accomplished_rides: number
	day_type: string
	holiday: string
	notes: string
	period: string
	scheduled_rides: number
	vkms_observed: number
	vkms_scheduled: number
}

// Supply document type
interface SupplyMetricDoc {
	data: Record<string, SupplyDayData>
	metric: 'supply_by_agency_by_day'
	properties: { agency_id: string }
}

/* * */

export async function calculateSupplyMetrics({ context, message }: TaskProps): Promise<SupplyMetricResult[]> {
	message('Calculating supply metrics...');

	const metricsCollection = await metrics.getCollection();

	// Fetch supply documents
	message('Fetching supply metrics...');
	const docs = await metricsCollection.find<SupplyMetricDoc>({
		metric: 'supply_by_agency_by_day',
	}).toArray();

	message(`Found ${docs.length} supply metrics`);

	const results = new Map<string, SupplyMetricResult>();

	const startDate = yyyymmddToDashed(context.dates.start);
	const endDate = yyyymmddToDashed(context.dates.end);

	// Process each document
	for (const doc of docs) {
		const agencyId = doc.properties.agency_id;

		for (const [date, dayData] of Object.entries(doc.data)) {
			// Direct YYYY-MM-DD comparison
			if (date < startDate || date > endDate) continue;

			const key = `${date}-${agencyId}`;

			if (!results.has(key)) {
				results.set(key, {
					agencyId,
					date,
					vkmsobserved: 0,
					vkmsobservedpct: 0,
					vkmsscheduled: 0,
				});
			}

			const entry = results.get(key);

			entry.vkmsobserved += dayData.vkms_observed;
			entry.vkmsscheduled += dayData.vkms_scheduled;
		}
	}

	// Calculate percentage at the end (after aggregation)
	const finalResults = Array.from(results.values()).map((entry) => {
		const pct
			= entry.vkmsscheduled > 0
				? Number(((entry.vkmsobserved / entry.vkmsscheduled) * 100).toFixed(2))
				: 0;

		return {
			...entry,
			vkmsobservedpct: pct,
		};
	});

	message(`Processed ${finalResults.length} supply records`);

	return finalResults;
}
