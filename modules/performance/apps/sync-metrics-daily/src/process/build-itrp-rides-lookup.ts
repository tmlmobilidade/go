/* * */

import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type OperationalDate } from '@tmlmobilidade/types';

/* * */

const CM_AGENCY_IDS = ['41', '42', '43', '44'] as const;

export type DayType = '1' | '2' | '3';

export type DayPeriod = 'PPM' | 'CD' | 'PPT' | 'N';

export interface ItrpDayTypeMetrics {
	/** N.º de carreiras/serviços = circulações previstas neste day_type */
	carreiras_servicos: number
	/** Veículos.km = carreiras_servicos × extensão prevista (km) */
	veiculos_km: number
}

export interface ItrpPeriodMetrics {
	/** N.º de carreiras/serviços = circulações previstas neste período do dia */
	carreiras_servicos: number
	/** Veículos.km = carreiras_servicos × extensão prevista (km) */
	veiculos_km: number
}

export interface ItrpRideMetrics {
	by_day_type: Record<DayType, ItrpDayTypeMetrics>
	by_period: Record<DayPeriod, ItrpPeriodMetrics>
	circulations_observed: number
	circulations_scheduled: number
	/** Extension in kilometers (from meters in rides). */
	extension_scheduled_km: number
	route_id: string
}

export interface ItrpDateRange {
	end: OperationalDate
	start: OperationalDate
}

interface ItrpRidesByDateHourAggRow {
	_id: {
		hour: number
		operational_date: string
		pattern_id: string
	}
	circulations_observed: number
	circulations_scheduled: number
	extension_scheduled: number
	route_id: string
}

/* * */

function emptyDayTypeMetrics(): ItrpDayTypeMetrics {
	return {
		carreiras_servicos: 0,
		veiculos_km: 0,
	};
}

function emptyByDayType(): Record<DayType, ItrpDayTypeMetrics> {
	return {
		1: emptyDayTypeMetrics(),
		2: emptyDayTypeMetrics(),
		3: emptyDayTypeMetrics(),
	};
}

function emptyPeriodMetrics(): ItrpPeriodMetrics {
	return {
		carreiras_servicos: 0,
		veiculos_km: 0,
	};
}

function emptyByPeriod(): Record<DayPeriod, ItrpPeriodMetrics> {
	return {
		CD: emptyPeriodMetrics(),
		N: emptyPeriodMetrics(),
		PPM: emptyPeriodMetrics(),
		PPT: emptyPeriodMetrics(),
	};
}

/** Map scheduled start hour (Europe/Lisbon) to ITRP day period.
 * PPM 07:00-09:59 | CD 10:00-16:59 | PPT 17:00-19:59 | Noite 20:00-06:59
 */
function periodFromHour(hour: number): DayPeriod | null {
	if (hour >= 7 && hour <= 9) return 'PPM';
	if (hour >= 10 && hour <= 16) return 'CD';
	if (hour >= 17 && hour <= 19) return 'PPT';
	if (hour >= 20 || hour <= 6) return 'N';
	return null;
}

/**
 * Aggregates MongoDB rides by pattern_id for ITRP enrichment,
 * including metrics split by calendar day_type (1/2/3) and day period (PPM/CD/PPT/N).
 */
export async function buildItrpRidesLookup(
	patternIds: string[],
	dates: ItrpDateRange,
): Promise<Map<string, ItrpRideMetrics>> {
	const lookup = new Map<string, ItrpRideMetrics>();

	if (patternIds.length === 0) {
		return lookup;
	}

	//
	// Calendar: operational_date (yyyyMMdd) → day_type

	const calendarJson = await Dates.fetchCalendarData();
	const dayTypeByOperationalDate = new Map<string, DayType>();

	for (const day of calendarJson ?? []) {
		const dateKey = String(day.date);
		const dayType = String(day.day_type) as DayType;
		if (dayType === '1' || dayType === '2' || dayType === '3') {
			dayTypeByOperationalDate.set(dateKey, dayType);
		}
	}

	Logger.info({
		message: `Loaded calendar with ${dayTypeByOperationalDate.size} dates for day_type mapping`,
	});

	const ridesCollection = await rides.getCollection();

	Logger.info({
		message: `Aggregating rides for ITRP by pattern, operational_date and hour (${patternIds.length} patterns, ${dates.start} → ${dates.end})...`,
	});

	const pipeline = [
		{
			$match: {
				agency_id: { $in: [...CM_AGENCY_IDS] },
				operational_date: { $gte: dates.start, $lte: dates.end },
				pattern_id: { $in: patternIds },
			},
		},
		{
			$group: {
				_id: {
					hour: {
						$hour: {
							date: { $toDate: '$start_time_scheduled' },
							timezone: 'Europe/Lisbon',
						},
					},
					operational_date: '$operational_date',
					pattern_id: '$pattern_id',
				},
				circulations_observed: {
					$sum: {
						$cond: [
							{
								$or: [
									{ $eq: ['$analysis.SIMPLE_ONE_APEX_VALIDATION.grade', 'pass'] },
									{ $eq: ['$analysis.SIMPLE_THREE_VEHICLE_EVENTS.grade', 'pass'] },
								],
							},
							1,
							0,
						],
					},
				},
				circulations_scheduled: { $sum: 1 },
				extension_scheduled: { $first: '$extension_scheduled' },
				route_id: { $first: '$route_id' },
			},
		},
	];

	const rows = await ridesCollection.aggregate<ItrpRidesByDateHourAggRow>(pipeline).toArray();

	let missingCalendarDates = 0;
	let missingPeriodHours = 0;

	for (const row of rows) {
		const patternId = String(row._id.pattern_id);
		const operationalDate = String(row._id.operational_date);
		const hour = Number(row._id.hour);
		const dayType = dayTypeByOperationalDate.get(operationalDate);
		const period = periodFromHour(hour);

		const extensionMeters = Number(row.extension_scheduled ?? 0);
		const extensionKm = Number.isFinite(extensionMeters) ? extensionMeters / 1000 : 0;
		const circulationsScheduled = Number(row.circulations_scheduled ?? 0);
		const circulationsObserved = Number(row.circulations_observed ?? 0);

		let metrics = lookup.get(patternId);
		if (!metrics) {
			metrics = {
				by_day_type: emptyByDayType(),
				by_period: emptyByPeriod(),
				circulations_observed: 0,
				circulations_scheduled: 0,
				extension_scheduled_km: extensionKm,
				route_id: String(row.route_id ?? ''),
			};
			lookup.set(patternId, metrics);
		}

		if (!metrics.route_id && row.route_id) {
			metrics.route_id = String(row.route_id);
		}
		if (!metrics.extension_scheduled_km && extensionKm) {
			metrics.extension_scheduled_km = extensionKm;
		}

		metrics.circulations_scheduled += circulationsScheduled;
		metrics.circulations_observed += circulationsObserved;

		if (dayType) {
			const dayMetrics = metrics.by_day_type[dayType];
			dayMetrics.carreiras_servicos += circulationsScheduled;
			dayMetrics.veiculos_km += circulationsScheduled * extensionKm;
		}
		else {
			missingCalendarDates++;
		}

		if (period) {
			const periodMetrics = metrics.by_period[period];
			periodMetrics.carreiras_servicos += circulationsScheduled;
			periodMetrics.veiculos_km += circulationsScheduled * extensionKm;
		}
		else {
			missingPeriodHours++;
		}
	}

	if (missingCalendarDates > 0) {
		Logger.info({
			message: `Skipped day_type for ${missingCalendarDates} pattern-date-hour groups without calendar day_type`,
		});
	}

	if (missingPeriodHours > 0) {
		Logger.info({
			message: `Skipped period for ${missingPeriodHours} pattern-date-hour groups without valid hour`,
		});
	}

	Logger.info({
		message: `Built ITRP rides lookup for ${lookup.size} patterns from ${rows.length} pattern-date-hour rows`,
	});

	return lookup;
}
