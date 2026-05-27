// ! THIS IS NOT WORKING, BECAUSE THE @tmlmobilidade/go-performance-pckg-dates is not a published package yet.
import { type TaskProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { type CalendarEntry, fetchCalendarData } from '@tmlmobilidade/go-performance-pckg-dates';
import { rides } from '@tmlmobilidade/interfaces';

export interface AgencyAverageRidesByDayTypeResult {
	agencyId: string
	averageRides: number
	dayType: string
}

export async function calculateAverageRidesByAgencyByDayType(
	{ context, message }: TaskProps,
): Promise<AgencyAverageRidesByDayTypeResult[]> {
	message('Calculating average rides per agency by day type...');

	const ridesCollection = await rides.getCollection();

	// Load calendar JSON
	const calendarJson = await fetchCalendarData();

	// Build calendar map: operational_date -> CalendarEntry
	const calendarMap = new Map<string, CalendarEntry>();
	for (const day of calendarJson) {
		calendarMap.set(day.date.toString(), day);
	}

	// Mongo aggregation: count total rides per agency and date
	const aggCursor = ridesCollection.aggregate([
		{
			$match: {
				agency_id: { $exists: true },
				operational_date: { $gte: context.dates.start as string, $lte: context.dates.end as string },
				system_status: 'complete',
			},
		},
		{
			$group: {
				_id: { agencyId: '$agency_id', operationalDate: '$operational_date' },
				totalTrips: { $sum: 1 },
			},
		},
	]);

	// Map in-memory: (agencyId + dayType) -> totalRides / totalDays
	const aggregationMap = new Map<string, { agencyId: string, dayType: string, totalDays: number, totalRides: number }>();

	for await (const doc of aggCursor) {
		const agencyId = doc._id.agencyId;
		const operationalDate = doc._id.operationalDate;

		const calendarProps = calendarMap.get(operationalDate);
		const dayType = calendarProps?.day_type ?? '1';

		const key = `${agencyId}:${dayType}`;

		if (!aggregationMap.has(key)) {
			aggregationMap.set(key, { agencyId, dayType, totalDays: 0, totalRides: 0 });
		}

		const entry = aggregationMap.get(key);
		entry.totalRides += doc.totalTrips;
		entry.totalDays += 1;
	}

	// Build final results
	const results: AgencyAverageRidesByDayTypeResult[] = [];
	for (const value of aggregationMap.values()) {
		results.push({
			agencyId: value.agencyId,
			averageRides: parseFloat((value.totalRides / value.totalDays).toFixed(2)),
			dayType: value.dayType,
		});
	}

	message(`Processed ${results.length} agency/day-type combinations`);
	return results;
}
