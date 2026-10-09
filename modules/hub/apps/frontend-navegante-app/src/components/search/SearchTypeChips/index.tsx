import { ScrollChips } from '@/components/common/lists/ScrollChips';
import { SEARCH_RESULT_TYPE_ORDER } from '@/constants/search';
import { type SearchGroup } from '@/types/common/search';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface SearchTypeChipsProps {
	onChange: (type: null | SearchGroup['key']) => void
	selectedType: null | SearchGroup['key']
}

/* * */

export function SearchTypeChips({ onChange, selectedType }: SearchTypeChipsProps) {
	const { t } = useTranslation();

	return (
		<ScrollChips>
			<div aria-label={t('default:search.Search.filter_types')} className={styles.chips} role="group">
				{SEARCH_RESULT_TYPE_ORDER.map(type => (
					<button
						key={type}
						aria-pressed={selectedType === type}
						className={styles.chip}
						data-active={selectedType === type}
						onClick={() => onChange(selectedType === type ? null : type)}
						type="button"
					>
						{t(`default:search.Search.groups.${type}`)}
					</button>
				))}
			</div>
		</ScrollChips>
	);
}
