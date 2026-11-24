/* * */

import { type TagProps } from '../../tags/Tag';
import { TagGroup } from '../../tags/TagGroup';

/* * */

interface GtfsValidationResultRowsProps {
	limit?: number
	rows: number[]
}

/* * */

export function GtfsValidationResultRows({ limit, rows }: GtfsValidationResultRowsProps) {
	//

	//
	// A. Transform data

	const preparedTags = rows
		.map((item): TagProps => ({ label: item, variant: 'muted' }))
		.filter(Boolean);

	//
	// B. Render components

	return <TagGroup limit={limit} tags={preparedTags} />;

	//
}
