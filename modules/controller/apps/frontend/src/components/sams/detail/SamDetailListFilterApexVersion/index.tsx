'use client';

/* * */

import { useSamsDetailContext } from '@/contexts/SamDetail.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

const normalizeApexValue = (value: null | string | undefined): string => {
	if (value == null) return '';
	const trimmed = value.trim();
	return trimmed;
};

/* * */

export function SamsDetailListFilterApexVersion() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const samDetailContext = useSamsDetailContext();

	//
	// B. Transform data

	const versionValues = useMemo(() => {
		const analysisRecords = samDetailContext.data.sam?.analysis ?? [];
		const unique = new Set<string>();
		for (const item of analysisRecords) {
			unique.add(normalizeApexValue(item.apex_version));
		}
		return [...unique].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
	}, [samDetailContext.data.sam?.analysis]);

	const selection = samDetailContext.ui.analysisApexVersionFilter;

	//
	// C. Render components

	const options = useMemo(
		() =>
			versionValues.map(value => ({
				checked: selection.includes(value),
				disabled: false,
				label: value === '' ? 'N/A' : value,
				value,
			})),
		[selection, versionValues],
	);

	const apexFilterActive = versionValues.length > 0 && selection.length > 0 && selection.length < versionValues.length;

	if (versionValues.length === 0) return null;

	return (
		<FilterTypeList
			active={apexFilterActive}
			label={t('default:sams.detail.SamsDetailList.SamsDetailListFilterApexVersion.label')}
			onChange={samDetailContext.actions.setAnalysisApexVersionFilter}
			options={options}
			isMultiple
			withToggleAll
		/>
	);
}
