import { ExportContext } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type Ride } from '@tmlmobilidade/types';

/* Types */

interface RideMetrics {
	'early_rides': number
	'five_min_delays': number
	'ontime_rides': number
	'pax-affected-by-delay': number
}

interface DailyResults {
	agencies: Record<string, RideMetrics>
	total: RideMetrics
}

type RideMetricsWithPct = RideMetrics & {
	early_rides_pct: number
	five_min_delays_pct: number
	ontime_rides_pct: number
};

interface DailyResultsWithPct {
	agencies: Record<string, RideMetricsWithPct>
	total: RideMetricsWithPct
}

/* Helper Function */
async function processDailyRides(
	stream: Iterable<Ride>,
	results: DailyResults,
	agencies: string[],
) {
	for (const rideData of stream) {
		const agency = rideData.agency_id;
		if (!agencies.includes(agency)) continue;
		if (rideData.system_status !== 'complete') continue;

		const analysis = rideData.analysis;
		if (!analysis) continue;

		const expectedStart = analysis.EXPECTED_START_TIME?.value;
		if (expectedStart === undefined || expectedStart === null) continue;

		if (expectedStart <= -1) {
			results.agencies[agency].early_rides++;
			results.total.early_rides++;
		}

		if (expectedStart > -1 && expectedStart <= 5) {
			results.agencies[agency].ontime_rides++;
			results.total.ontime_rides++;
		}

		if (expectedStart > 5) {
			results.agencies[agency].five_min_delays++;
			results.total.five_min_delays++;

			const passengers = rideData.passengers_observed ?? 0;
			results.agencies[agency]['pax-affected-by-delay']
				= (results.agencies[agency]['pax-affected-by-delay'] ?? 0) + passengers;
			results.total['pax-affected-by-delay']
				= (results.total['pax-affected-by-delay'] ?? 0) + passengers;
		}
	}
}

/* Percentages */
function calculatePercentages(metrics: RideMetrics) {
	const total = metrics.early_rides + metrics.five_min_delays + metrics.ontime_rides;
	if (total === 0)
		return { early_rides_pct: 0, five_min_delays_pct: 0, ontime_rides_pct: 0 };

	return {
		early_rides_pct: parseFloat(((metrics.early_rides / total) * 100).toFixed(1)),
		five_min_delays_pct: parseFloat(((metrics.five_min_delays / total) * 100).toFixed(1)),
		ontime_rides_pct: parseFloat(((metrics.ontime_rides / total) * 100).toFixed(1)),
	};
}

/* Main Function */
export const calculateDailyServiceCompliance = async (context: ExportContext) => {
	const agencies = ['41', '42', '43', '44'];
	const ridesCollection = await rides.getCollection();

	const processingTimer = new Timer();
	let countProcessed = 0;

	const resultsByDay: Record<string, DailyResults> = {};

	// const ridesQuery = {
	// 	operational_date: { $gte: context.dates.start, $lte: context.dates.end },
	// };

	const ridesQuery = {
		$expr: {
			$or: [
				{ $eq: ['$analysis.SIMPLE_ONE_APEX_VALIDATION.grade', 'pass'] },
				{ $eq: ['$analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade', 'pass'] },
			],
		},
		operational_date: { $gte: context.dates.start, $lte: context.dates.end },
	};

	const allRidesStream = ridesCollection.find(ridesQuery).batchSize(100_000).stream();

	for await (const ride of allRidesStream) {
		const rideData: Ride = ride as Ride;

		const dayOperationalStr = Dates.fromOperationalDate(rideData.operational_date, 'Europe/Lisbon').toFormat(
			'yyyyMMdd',
		);

		if (!resultsByDay[dayOperationalStr]) {
			resultsByDay[dayOperationalStr] = {
				agencies: {} as Record<string, RideMetrics>,
				total: { 'early_rides': 0, 'five_min_delays': 0, 'ontime_rides': 0, 'pax-affected-by-delay': 0 },
			};
			agencies.forEach((op) => {
				resultsByDay[dayOperationalStr].agencies[op] = {
					'early_rides': 0,
					'five_min_delays': 0,
					'ontime_rides': 0,
					'pax-affected-by-delay': 0,
				};
			});
		}

		await processDailyRides([rideData], resultsByDay[dayOperationalStr], agencies);

		countProcessed++;
		if (countProcessed % 100 === 0) {
			// Logger.info({ message: `Processed ${countProcessed} rides so far...` });
		}
	}

	Logger.info({ message: `Ride processing completed in ${processingTimer.get()} ms` });

	/* Format results and calculate percentages */
	const formattedResults: Record<string, DailyResultsWithPct> = {};
	for (const day in resultsByDay) {
		const displayDate = Dates.fromOperationalDate(day, 'Europe/Lisbon').toFormat('dd/MM/yyyy');
		const dayMetrics = resultsByDay[day];

		const agenciesWithPct: Record<string, RideMetricsWithPct> = {};
		for (const agencyId of Object.keys(dayMetrics.agencies)) {
			const percentages = calculatePercentages(dayMetrics.agencies[agencyId]);
			agenciesWithPct[agencyId] = { ...dayMetrics.agencies[agencyId], ...percentages };
		}

		const totalPercentages = calculatePercentages(dayMetrics.total);
		const totalWithPct: RideMetricsWithPct = { ...dayMetrics.total, ...totalPercentages };

		formattedResults[displayDate] = {
			agencies: agenciesWithPct,
			total: totalWithPct,
		};
	}

	return formattedResults;
};
