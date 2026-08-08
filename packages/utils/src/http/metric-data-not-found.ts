/* * */

interface MetricDataNotFoundMessageOptions {
	entityIds: string[]
	entityNames: {
		plural: string
		singular: string
	}
	metricName: string
}

/* * */

export function buildMetricDataNotFoundMessage({
	entityIds,
	entityNames,
	metricName,
}: MetricDataNotFoundMessageOptions) {
	if (entityIds.length === 0) return `No ${metricName} data found`;

	const isSingleEntity = entityIds.length === 1;
	const entityName = isSingleEntity ? entityNames.singular : entityNames.plural;
	const capitalizedEntityName = `${entityName[0]?.toUpperCase()}${entityName.slice(1)}`;
	const verb = isSingleEntity ? 'has' : 'have';

	return `${capitalizedEntityName} not found or ${verb} no ${metricName} data: ${entityIds.join(', ')}`;
}
