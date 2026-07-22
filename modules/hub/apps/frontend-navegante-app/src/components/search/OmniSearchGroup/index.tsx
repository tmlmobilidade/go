'use client';

import { RegularListItem } from '@/components/common/lists/RegularListItem';
import { OmniSearchResultDisplay } from '@/components/search/OmniSearchResultDisplay';
import { type OmniSearchGroup as OmniSearchGroupData, type OmniSearchResult } from '@/hooks/search/useOmniSearch';
import { IconAlertTriangle, IconBusStop, IconMapPin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface OmniSearchGroupProps {
	group: OmniSearchGroupData
	onSelect: (result: OmniSearchResult) => void
	variant: 'sheet' | 'top'
}

/* * */

export function OmniSearchGroup({ group, onSelect, variant }: OmniSearchGroupProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<section className={styles.group} data-variant={variant}>
			<h2>{t(`default:search.OmniSearch.groups.${group.key}`)}</h2>
			{group.results.map(result => (
				<RegularListItem key={`${result.type}-${result.id}`} icon={getResultIcon(result)} onClick={() => onSelect(result)}>
					<OmniSearchResultDisplay result={result} />
				</RegularListItem>
			))}
		</section>
	);

	//
}

/* * */

function getResultIcon(result: OmniSearchResult) {
	if (result.type === 'alert') return <IconAlertTriangle size={22} />;
	if (result.type === 'poi') return <IconMapPin size={22} />;
	if (result.type === 'stop') return <IconBusStop size={22} />;
	return undefined;
}
