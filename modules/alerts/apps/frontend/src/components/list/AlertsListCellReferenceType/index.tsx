'use client';

import { type Alert } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface AlertsListCellReferenceTypeProps {
	value: Alert['reference_type']
}

/* * */

export function AlertsListCellReferenceType({ value }: AlertsListCellReferenceTypeProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return <Tag label={t(`shared:alerts.reference_types.${value}.title`)} />;

	//
}
