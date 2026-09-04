/* * */

export interface PassengerDemandQueryFilters {
	agencyId?: string
	agencyIds?: string[]
	dataStatus?: 'provisional' | 'reconciled'
	endDate: string
	excludeUnknown?: boolean
	hourEnd?: number
	hourStart?: number
	lineId?: string
	lineIds?: string[]
	patternId?: string
	patternIds?: string[]
	startDate: string
	stopId?: string
	stopIds?: string[]
}

/* * */

export function createPassengerDemandQuery(filters: PassengerDemandQueryFilters) {
	const query = new URLSearchParams();
	if (filters.agencyId) query.set('agency_id', filters.agencyId);
	filters.agencyIds?.forEach(value => query.append('agency_ids', value));
	if (filters.dataStatus) query.set('data_status', filters.dataStatus);
	query.set('end_date', filters.endDate);
	if (filters.excludeUnknown !== undefined) query.set('exclude_unknown', String(filters.excludeUnknown));
	if (filters.hourEnd !== undefined) query.set('hour_end', String(filters.hourEnd));
	if (filters.hourStart !== undefined) query.set('hour_start', String(filters.hourStart));
	if (filters.lineId) query.set('line_id', filters.lineId);
	filters.lineIds?.forEach(value => query.append('line_ids', value));
	if (filters.patternId) query.set('pattern_id', filters.patternId);
	filters.patternIds?.forEach(value => query.append('pattern_ids', value));
	query.set('start_date', filters.startDate);
	if (filters.stopId) query.set('stop_id', filters.stopId);
	filters.stopIds?.forEach(value => query.append('stop_ids', value));
	return query;
}

/* * */
