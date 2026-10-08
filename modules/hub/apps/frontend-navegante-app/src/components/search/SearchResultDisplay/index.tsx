import { LineDisplay } from '@/components/lines/common/LineDisplay';
import { SearchAgencyLogos } from '@/components/search/SearchAgencyLogos';
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
				<span className={styles.resultMeta}>
					<small>{getResultDetail(result)}</small>
					<SearchAgencyLogos agencyIds={result.entity.agency_ids} />
				</span>
			</div>
		);
	}

	if (result.type === 'alert') {
		return (
			<div className={styles.resultDisplay}>
				<strong>{result.label}</strong>
				<span className={styles.resultMeta}>
					{result.entity.description && <small>{result.entity.description}</small>}
					<SearchAgencyLogos agencyIds={[result.entity.agency_id]} />
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
	if (result.type === 'stop') return [result.entity.locality_name, result.entity.municipality_name].filter(Boolean).join(' | ');
	if (result.type !== 'poi') return '';
	return [result.entity.street, result.entity.areas?.map(area => area.name).filter(Boolean).slice(0, 2).join(', ')].filter(Boolean).join(' | ') || result.entity.detail;
}
