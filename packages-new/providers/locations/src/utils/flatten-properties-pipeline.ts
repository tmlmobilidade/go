/* * */

/**
 * Aggregation stages that strip geometry, flatten properties onto the root document, and sort by _id.
 */
export function flattenPropertiesPipeline() {
	return [
		{ $project: { geometry: 0 } },
		{ $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', '$properties'] } } },
		{ $unset: 'properties' },
		{ $sort: { _id: 1 } },
	];
}
