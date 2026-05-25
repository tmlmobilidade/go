'use client';

import { FoundItemsCounter } from '@/components/common/FoundItemsCounter';
import { Section } from '@/components/layout/Section';
import { Surface } from '@/components/layout/Surface';
import { useLinesListContext } from '@/contexts/LinesList.context';
import { TextInput } from '@mantine/core';
import { IconArrowLoopRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

/* * */

export function LinesListToolbar() {
	//

	//
	// A. Setup variables

	const t = useTranslations('lines.LinesListToolbar');
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
			<Section heading={t('heading')} withGap withPadding>
				<TextInput leftSection={<IconArrowLoopRight size={20} />} onChange={handleTextInputChange} placeholder={t('by_search.placeholder')} type="search" value={linesContext.filters.by_search} w="100%" />
				<FoundItemsCounter text={t('found_items_counter.all', { count: linesContext.data.filtered.length })} />
			</Section>
		</Surface>
	);

	//
}
