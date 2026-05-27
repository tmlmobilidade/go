'use client';

import { FoundItemsCounter } from '@/components/layout/FoundItemsCounter';
import { Section } from '@/components/layout/Section';
import { Surface } from '@/components/layout/Surface';
import { useLinesListContext } from '@/components/lines/list/LinesList.context';
import { TextInput } from '@mantine/core';
import { IconArrowLoopRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/* * */

export function LinesListToolbar() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const linesContext = useLinesListContext();

	//
	// B. Handle actions

	const handleTextInputChange = ({ currentTarget }) => {
		linesContext.actions.updateFilterBySearch(currentTarget.value);
	};

	//
	// C. Render components

	return (
		<Surface>
			<Section heading={t('default:lines.LinesListToolbar.heading')} withGap withPadding>
				<TextInput leftSection={<IconArrowLoopRight size={20} />} onChange={handleTextInputChange} placeholder={t('default:lines.LinesListToolbar.by_search.placeholder')} type="search" value={linesContext.filters.by_search} w="100%" />
				<FoundItemsCounter text={t('default:lines.LinesListToolbar.found_items_counter.all', { count: linesContext.data.filtered.length })} />
			</Section>
		</Surface>
	);

	//
}
