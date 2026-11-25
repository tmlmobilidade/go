'use client';

import { type GtfsValidationOutputMessage } from '@tmlmobilidade/go-types-gtfs-validator';
import { TagGroup, type TagProps } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface ValidationsDetailResultRowsProps {
	rows: GtfsValidationOutputMessage['rows']
}

/* * */

export function ValidationsDetailResultRows({ rows }: ValidationsDetailResultRowsProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const tags = rows.map((row): TagProps => ({ label: row, variant: 'muted' }));

	//
	// C. Render components

	if (rows.length === 0) return t('validations:detail.ValidationsDetailResultRows.empty');

	return <TagGroup limit={10} tags={tags} wrap="wrap" />;

	//
}
