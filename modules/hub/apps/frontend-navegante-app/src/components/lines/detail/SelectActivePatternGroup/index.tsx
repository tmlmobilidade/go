'use client';

import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { SelectPattern } from '@/components/lines/detail/SelectPattern';
import { IconArrowBarToRight } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function SelectActivePatternGroup() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const linesDetailContext = useLinesDetailContext();

	//
	// B. Transform data

	const validPatternGroupsSelectOptions = useMemo(() => {
		if (!linesDetailContext.data.valid_patterns) return [];
		return linesDetailContext.data.valid_patterns;
	}, [linesDetailContext.data.valid_patterns]);

	//
	// C. Render components

	if (!validPatternGroupsSelectOptions) {
		return null;
	}

	return (
		<SelectPattern
			leftSection={<IconArrowBarToRight size={20} />}
			onChange={linesDetailContext.actions.setActivePattern}
			patterns={validPatternGroupsSelectOptions}
			placeholder={t('default:lines.SelectActivePatternGroup.placeholder')}
			value={linesDetailContext.data.active_pattern?.version_id || null}
			clearable
			searchable
		/>
	);

	//
}
