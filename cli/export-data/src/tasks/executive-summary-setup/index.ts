/* eslint-disable perfectionist/sort-objects */
import { type TaskProps } from '@/types.js';
import { log } from 'node:console';
import fs from 'node:fs';

import { calculateAverageRidesByAgencyByDayType } from './avg-trips-day.js';
import { calculateObservedTrips } from './empty-runs.js';
import { calculateSupplyMetrics } from './km.js';
import { calculateMedianSpeed } from './median-speed.js';
import { calculateOnBoardSales } from './on-board-sales.js';
import { calculateAffectedPassengers } from './passenger-impact.js';
import { calculateDemandFromMetrics, DemandMetricResult } from './passengers-transported.js';
import { calculatePassengersPerKm } from './paxperkm.js';
import { calculateCompletedTrips, calculatePlannedTrips } from './trips.js';
import { calculateDailyServiceCompliance } from './tripstatus.js';

// Interfaces

interface ExecutiveSummaryRow extends DemandMetricResult {
	[dayTypeKey: `avg_trips_day_type ${number}`]: number | undefined
	completedTrips?: number
	medianSpeed?: number
	onBoardSalesPr?: number
	passengersPerKm?: number
	pax_affected_by_delay?: number
	pax_affected_by_failures?: number
	plannedTrips?: number
	tripsWithPassengers?: number
	tripsZeroPassengers?: number
	vkmsObserved?: number
	vkmsScheduled?: number
}

interface ExecutiveSummaryAgencyTotals {
	[dayTypeKey: `avg_trips_day_type ${number}`]: number | undefined
	agencyId: string
	category: { on_board_sale: number, prepaid: number, subscription: number }
	dailyServiceCompliance?: { earlyRides: number, earlyRidesPct?: number, fiveMinDelays: number, fiveMinDelaysPct?: number, onTimeRides: number, onTimeRidesPct?: number }
	km: { observed: number, observedPct?: number, scheduled: number }
	medianSpeed?: number
	onBoardSalesPr?: number
	passengersPerKm?: number
	pax_affected_by_delay?: number
	pax_affected_by_failures?: number
	product_id: { 'id-prod-navegante-65': number, 'id-prod-navegante-metro': number, 'id-prod-navegante-metro-418-gratuito': number, 'id-prod-navegante-metro-sub23-grat': number, 'others': number }
	totalPassengers: { value: number }
	trips: { completed: number, completedPct?: number, planned: number, withPassengers: number, zeroPassengers: { count: number, percentage?: number } }
}

// Helper

function normalizeDate(date: string): string {
	const isoMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;

	const dmyMatch = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
	if (dmyMatch) return date;

	const compactMatch = date.match(/^(\d{4})(\d{2})(\d{2})$/);
	if (compactMatch) return `${compactMatch[3]}/${compactMatch[2]}/${compactMatch[1]}`;

	throw new Error(`Unknown date format: ${date}`);
}

// Export

export async function exportExecutiveSummary({ context, message }: TaskProps): Promise<void> {
	message('Starting export of Executive Summary JSON...');

	// Fetch metrics
	const medianSpeedResults = await calculateMedianSpeed({ context, message });
	const demandMetrics = await calculateDemandFromMetrics({ context, message });
	const plannedTripsMetrics = await calculatePlannedTrips({ context, message });
	const completedTripsMetrics = await calculateCompletedTrips({ context, message });
	const observedTripsMetrics = await calculateObservedTrips({ context, message });
	const circulationMetrics = await calculateSupplyMetrics({ context, message });
	const affectedPassengersMetrics = await calculateAffectedPassengers({ context, message });
	const passengersPerKmMetrics = await calculatePassengersPerKm({ context, message });
	const onBoardSalesMetrics = await calculateOnBoardSales({ context, message });

	log(`✓ Median Speeds: ${medianSpeedResults.length}`);
	log(`✓ Demand: ${demandMetrics.length}`);
	log(`✓ Planned: ${plannedTripsMetrics.length}`);
	log(`✓ Completed: ${completedTripsMetrics.length}`);
	log(`✓ Observed trips: ${observedTripsMetrics.length}`);
	log(`✓ Circulations: ${circulationMetrics.length}`);
	log(`✓ Affected passengers: ${affectedPassengersMetrics.length}`);
	log(`✓ Passengers per Km: ${passengersPerKmMetrics.length}`);
	log(`✓ On-board sales: ${onBoardSalesMetrics.length}`);

	// Merge all metrics by date + agency
	const mergedResults = new Map<string, ExecutiveSummaryRow>();

	function ensureRow(date: string | undefined, agencyId: string): ExecutiveSummaryRow {
		const key = `${date ?? 'NA'}-${agencyId}`;
		if (!mergedResults.has(key)) {
			mergedResults.set(key, {
				date,
				agencyId,
				totalpassengers: 0,
				byCategory: {},
				byProduct: {},
				pax_affected_by_failures: 0,
				pax_affected_by_delay: 0,
			} as ExecutiveSummaryRow);
		}
		return mergedResults.get(key);
	}

	// Demand
	for (const row of demandMetrics) {
		const r = ensureRow(row.date, row.agencyId);
		r.totalpassengers = row.totalpassengers;
		r.byCategory = {
			on_board_sale: row.byCategory?.on_board_sale ?? 0,
			subscription: row.byCategory?.subscription ?? 0,
			prepaid: row.byCategory?.prepaid ?? 0,
		};
		r.byProduct = { ...row.byProduct };
	}

	// Planned
	for (const row of plannedTripsMetrics) {
		const r = ensureRow(row.date, row.agencyId);
		r.plannedTrips = row.plannedTrips;
	}

	// Completed
	for (const row of completedTripsMetrics) {
		const r = ensureRow(row.date, row.agencyId);
		r.completedTrips = row.completedTrips;
	}

	// Observed Trips
	for (const row of observedTripsMetrics) {
		const r = ensureRow(row.date, row.agencyId);
		r.tripsZeroPassengers = row.tripszeropassengers;
		r.tripsWithPassengers = row.tripswpassengers;
	}

	// Circulations (KM)
	for (const row of circulationMetrics) {
		const r = ensureRow(row.date, row.agencyId);
		r.vkmsObserved = (r.vkmsObserved ?? 0) + (row.vkmsobserved ?? 0);
		r.vkmsScheduled = (r.vkmsScheduled ?? 0) + (row.vkmsscheduled ?? 0);
	}

	// Median Speed
	for (const row of medianSpeedResults) {
		const r = ensureRow(undefined, row.agencyId);
		r.medianSpeed = row.medianSpeed ?? 0;
	}

	// Affected passengers
	for (const row of affectedPassengersMetrics) {
		const r = ensureRow(row.date, row.agencyId);
		r.pax_affected_by_failures += row.estimatedpax_affected_by_failures ?? 0;
	}

	// Passengers per Km
	for (const row of passengersPerKmMetrics) {
		const r = ensureRow(undefined, row.agencyId);
		r.passengersPerKm = row.passengersPerKm;
	}

	// On-board Sales
	for (const row of onBoardSalesMetrics) {
		const r = ensureRow(row.date, row.agencyId);
		r.onBoardSalesPr = (r.onBoardSalesPr ?? 0) + row['onboard-sales-pr'];
	}

	// Helper for median calculation
	function calculateMedian(values: number[]): number {
		if (!values.length) return 0;
		const sorted = [...values].sort((a, b) => a - b);
		const middle = Math.floor(sorted.length / 2);
		return sorted.length % 2 === 0
			? parseFloat(((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2))
			: parseFloat(sorted[middle].toFixed(2));
	}

	// Aggregate by agency
	const totalsByAgency: Record<string, ExecutiveSummaryAgencyTotals & { __medianSpeeds: number[] }> = {};

	for (const row of mergedResults.values()) {
		const agencyId = row.agencyId;

		if (!totalsByAgency[agencyId]) {
			totalsByAgency[agencyId] = {
				agencyId,
				totalPassengers: { value: 0 },
				trips: {
					planned: 0,
					completed: 0,
					completedPct: 0,
					withPassengers: 0,
					zeroPassengers: { count: 0, percentage: 0 },
				},
				category: { on_board_sale: 0, subscription: 0, prepaid: 0 },
				km: { observed: 0, scheduled: 0, observedPct: 0 },
				product_id: {
					'id-prod-navegante-metro': 0,
					'id-prod-navegante-metro-418-gratuito': 0,
					'id-prod-navegante-metro-sub23-grat': 0,
					'id-prod-navegante-65': 0,
					'others': 0,
				},
				dailyServiceCompliance: { earlyRides: 0, fiveMinDelays: 0, onTimeRides: 0, earlyRidesPct: 0, fiveMinDelaysPct: 0, onTimeRidesPct: 0 },
				medianSpeed: 0,
				passengersPerKm: 0,
				onBoardSalesPr: 0,
				pax_affected_by_failures: 0,
				pax_affected_by_delay: 0,
				__medianSpeeds: [],
			};
		}

		const t = totalsByAgency[agencyId];

		t.totalPassengers.value += row.totalpassengers ?? 0;
		t.pax_affected_by_failures += row.pax_affected_by_failures ?? 0;
		t.pax_affected_by_delay += row.pax_affected_by_delay ?? 0;

		t.trips.planned += row.plannedTrips ?? 0;
		t.trips.completed += row.completedTrips ?? 0;
		t.trips.withPassengers += row.tripsWithPassengers ?? 0;
		t.trips.zeroPassengers.count += row.tripsZeroPassengers ?? 0;

		t.km.observed += row.vkmsObserved ?? 0;
		t.km.scheduled += row.vkmsScheduled ?? 0;

		if (row.medianSpeed !== undefined && row.medianSpeed !== null) {
			t.__medianSpeeds.push(row.medianSpeed);
		}

		t.category.on_board_sale += row.byCategory?.on_board_sale ?? 0;
		t.category.subscription += row.byCategory?.subscription ?? 0;
		t.category.prepaid += row.byCategory?.prepaid ?? 0;

		t.onBoardSalesPr += row.onBoardSalesPr ?? 0;

		const byProduct = { ...row.byProduct };
		const metro = byProduct['id-prod-navegante-metro'] ?? 0;
		const sub23 = byProduct['id-prod-navegante-metro-sub23-grat'] ?? 0;
		const p65 = byProduct['id-prod-navegante-65'] ?? 0;
		const metro418 = byProduct['id-prod-navegante-metro-418-gratuito'] ?? 0; ;

		const totalProducts = Object.values(byProduct).reduce((a, b) => a + b, 0);
		const others = totalProducts - (metro + sub23 + p65 + metro418);

		t.product_id['id-prod-navegante-metro'] += metro;
		t.product_id['id-prod-navegante-metro-418-gratuito'] += metro418;
		t.product_id['id-prod-navegante-metro-sub23-grat'] += sub23;
		t.product_id['id-prod-navegante-65'] += p65;
		t.product_id.others += others;

		t.passengersPerKm += row.passengersPerKm ?? 0;
	}

	// Calculate percentages
	for (const agency of Object.values(totalsByAgency)) {
		agency.medianSpeed = calculateMedian(agency.__medianSpeeds);
		delete agency.__medianSpeeds;

		if (agency.trips.planned > 0) agency.trips.completedPct = parseFloat(((agency.trips.completed / agency.trips.planned) * 100).toFixed(1));
		if (agency.trips.withPassengers > 0) agency.trips.zeroPassengers.percentage = parseFloat(((agency.trips.zeroPassengers.count / agency.trips.withPassengers) * 100).toFixed(1));
		if (agency.km.scheduled > 0) agency.km.observedPct = parseFloat(((agency.km.observed / agency.km.scheduled) * 100).toFixed(1));
	}

	// Daily service compliance
	const dailyResults = await calculateDailyServiceCompliance(context);
	for (const day of Object.keys(dailyResults)) {
		const dayData = dailyResults[day];
		for (const agencyId of Object.keys(dayData.agencies)) {
			if (totalsByAgency[agencyId]) {
				const dailyMetrics = dayData.agencies[agencyId];
				const agencyTotals = totalsByAgency[agencyId];

				agencyTotals.dailyServiceCompliance.earlyRides += dailyMetrics.early_rides;
				agencyTotals.dailyServiceCompliance.fiveMinDelays += dailyMetrics.five_min_delays;
				agencyTotals.dailyServiceCompliance.onTimeRides += dailyMetrics.ontime_rides;

				// Add passengers affected by delays ≥5 min
				agencyTotals.pax_affected_by_delay = (agencyTotals.pax_affected_by_delay ?? 0) + (dailyMetrics['pax-affected-by-delay'] ?? 0);

				const total = agencyTotals.dailyServiceCompliance.earlyRides + agencyTotals.dailyServiceCompliance.fiveMinDelays + agencyTotals.dailyServiceCompliance.onTimeRides;
				if (total > 0) {
					agencyTotals.dailyServiceCompliance.earlyRidesPct = parseFloat(((agencyTotals.dailyServiceCompliance.earlyRides / total) * 100).toFixed(1));
					agencyTotals.dailyServiceCompliance.fiveMinDelaysPct = parseFloat(((agencyTotals.dailyServiceCompliance.fiveMinDelays / total) * 100).toFixed(1));
					agencyTotals.dailyServiceCompliance.onTimeRidesPct = parseFloat(((agencyTotals.dailyServiceCompliance.onTimeRides / total) * 100).toFixed(1));
				} else {
					agencyTotals.dailyServiceCompliance.earlyRidesPct = 0;
					agencyTotals.dailyServiceCompliance.fiveMinDelaysPct = 0;
					agencyTotals.dailyServiceCompliance.onTimeRidesPct = 0;
				}
			}
		}
	}

	// Add avg_trips_day_type
	const avgRidesByDayType = await calculateAverageRidesByAgencyByDayType({ context, message });
	for (const row of avgRidesByDayType) {
		const agencyTotals = totalsByAgency[row.agencyId];
		if (!agencyTotals) continue;
		const dayTypeKey = `avg_trips_day_type ${row.dayType}` as const;
		agencyTotals[dayTypeKey] = row.averageRides;
	}

	// Build final output
	const finalOutput = {
		timestamp: Date.now(),
		startDayAnalysis: normalizeDate(context.dates.start),
		endDayAnalysis: normalizeDate(context.dates.end),
		totalsByAgency: Object.values(totalsByAgency),
	};

	if (!fs.existsSync(context.output)) fs.mkdirSync(context.output, { recursive: true });
	const outputPath = `${context.output}/executive-summary-${context.dates.start}-${context.dates.end}.json`;
	fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2), 'utf-8');

	message('✓ Executive Summary JSON export completed');
}
