/* * */

import { MetricText } from '@/components/common/MetricText';
import { type DataTableV2Column, Label, Section, Tag } from '@tmlmobilidade/ui';
import { type TFunction } from 'i18next';

import { type LineOverviewPatternTableRow } from './types';

/* * */

export function createLineOverviewPatternColumns(t: TFunction): DataTableV2Column<LineOverviewPatternTableRow>[] {
	return [
		{
			id: 'pattern',
			render: pattern => (
				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					<Tag label={pattern.code} variant="secondary" />
					<Label singleLine>{pattern.label}</Label>
				</Section>
			),
			sortable: true,
			sortDirection: 'asc',
			sortValue: pattern => pattern.code,
			title: t('lineDetail.patternsTable.columns.pattern'),
			width: '42%',
		},
		{
			align: 'center',
			id: 'validations',
			render: pattern => <MetricText as="strong" format="compact" value={pattern.validations} />,
			sortable: true,
			sortValue: pattern => pattern.validations,
			title: t('lineDetail.patternsTable.columns.validations'),
			width: '14%',
		},
		{
			align: 'center',
			id: 'service',
			render: pattern => <MetricText as="strong" format="percentage" value={pattern.service} />,
			sortable: true,
			sortValue: pattern => pattern.service,
			title: t('lineDetail.patternsTable.columns.service'),
			width: '14%',
		},
		{
			align: 'center',
			id: 'delays',
			render: pattern => <MetricText as="strong" format="percentage" value={pattern.delays} />,
			sortable: true,
			sortValue: pattern => pattern.delays,
			title: t('lineDetail.patternsTable.columns.delays'),
			width: '14%',
		},
		{
			align: 'center',
			id: 'advances',
			render: pattern => <MetricText as="strong" format="percentage" value={pattern.advances} />,
			sortable: true,
			sortValue: pattern => pattern.advances,
			title: t('lineDetail.patternsTable.columns.advances'),
			width: '16%',
		},
	];
}
