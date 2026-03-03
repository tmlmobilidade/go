import { type TaskProps } from '@/types.js';
import { yyyymmddToDashed } from '@/utils/dates-helper.js';
import { metrics } from '@tmlmobilidade/interfaces';

/* Result type for affected passengers per agency per day */
export interface PaxAffectedByFailuresResult {
	agencyId: string
	date: string
	estimatedpax_affected_by_failures: number
}

/* Type for the "failed circulations" metric documents */
interface FailedCirculationsMetric {
	data: Record<
		string,
		{
			estimated_affected_passengers: number
			failed_circulations: number
		}
	>
	metric: 'demand_affected_by_failed_circulations_by_day'
	properties: {
		agency_id: string
	}
}

/**
 * Calculates the estimated affected passengers by agency and day
 * from the "demand_affected_by_failed_circulations_by_day" metric.
 */
export async function calculateAffectedPassengers({ context, message }: TaskProps): Promise<PaxAffectedByFailuresResult[]> {
	message('Calculating passengers affected by failed circulations...');

	const metricsCollection = await metrics.getCollection();

	// Fetch only the relevant metric documents
	message('Fetching affected passengers metrics...');
	const docs = await metricsCollection
		.find<FailedCirculationsMetric>({
			metric: 'demand_affected_by_failed_circulations_by_day',
		})
		.toArray();

	message(`Found ${docs.length} documents to process`);

	const results = new Map<string, PaxAffectedByFailuresResult>(); // key = `${date}-${agencyId}`

	const startDate = yyyymmddToDashed(context.dates.start);
	const endDate = yyyymmddToDashed(context.dates.end);

	// Process each metric document
	for (const doc of docs) {
		const agencyId = doc.properties.agency_id;

		for (const [date, dayData] of Object.entries(doc.data)) {
			// Skip dates outside the context range
			if (date < startDate.replace(/-/g, '') || date > endDate.replace(/-/g, '')) continue;

			const dashedDate = yyyymmddToDashed(date);
			const key = `${dashedDate}-${agencyId}`;

			// Initialize entry if it doesn't exist
			if (!results.has(key)) {
				results.set(key, {
					agencyId,
					date: dashedDate,
					estimatedpax_affected_by_failures: 0,
				});
			}

			// Add estimated affected passengers
			const entry = results.get(key);
			entry.estimatedpax_affected_by_failures += dayData.estimated_affected_passengers;
		}
	}

	message(`Processed ${results.size} affected passenger records`);

	// Return results as an array
	return Array.from(results.values());
}
