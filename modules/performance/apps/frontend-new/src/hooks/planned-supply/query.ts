/* * */

export interface PlannedSupplyQueryFilters {
	agencyId: string
	endDate: string
	lineId: string
	startDate: string
}

export function createPlannedSupplyQuery(filters: PlannedSupplyQueryFilters) {
	return new URLSearchParams({
		agency_id: filters.agencyId,
		end_date: filters.endDate,
		line_id: filters.lineId,
		start_date: filters.startDate,
	});
}

/* * */
