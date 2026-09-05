import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { SearchStopAgencyLogos } from '@/components/search/SearchStopAgencyLogos';
import { type SearchResult } from '@/types/common/search';

import styles from './styles.module.css';

/* * */

interface SearchResultDisplayProps {
	result: SearchResult
}

/* * */

export function SearchResultDisplay({ result }: SearchResultDisplayProps) {
	if (result.type === 'line') return <LineDisplay lineData={result.entity} />;

	if (result.type === 'stop') {
		return (
			<div className={styles.stopDisplay}>
				<strong>{result.label}</strong>
				<span>
					<small>{getResultDetail(result)}</small>
					<SearchStopAgencyLogos agencyIds={result.entity.agency_ids} />
				</span>
			</div>
		);
	}

	const detail = getResultDetail(result);

	return (
		<div className={styles.resultDisplay}>
			<strong>{result.label}</strong>
			{detail && <small>{detail}</small>}
		</div>
	);
}

/* * */

function getResultDetail(result: SearchResult) {
	if (result.type === 'alert') return result.entity.description;
	if (result.type === 'line') return '';
	if (result.type === 'stop') return [result.entity.locality_name, result.entity.municipality_name].filter(Boolean).join(' | ');
	return [result.entity.street, result.entity.areas?.map(area => area.name).filter(Boolean).slice(0, 2).join(', ')].filter(Boolean).join(' | ');
}
