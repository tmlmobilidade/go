'use client';

import { type AlertReferenceType } from '@tmlmobilidade/go-types-operation';
import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface AlertsListCellReferenceTypeProps {
	value: AlertReferenceType
}

/* * */

export function AlertsListCellReferenceType({ value }: AlertsListCellReferenceTypeProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return <Tag label={t(`reference_types:${value}`)} />;
}
