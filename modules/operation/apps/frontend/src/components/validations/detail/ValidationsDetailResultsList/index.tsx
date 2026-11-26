'use client';

import { ValidationsDetailResultListItem } from '@/components/validations/detail/ValidationsDetailResultListItem';
import { useValidationsDetailResultsContext } from '@/components/validations/detail/ValidationsDetailResults.context';
import { NoDataLabel, Pane } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { ValidationsDetailResultsListHeader } from '../ValidationsDetailResultsListHeader';

/* * */

export function ValidationsDetailResultsList() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, data } = useValidationsDetailResultsContext();

	//
	// B. Render components

	return (
		<Pane header={[
			<ValidationsDetailResultsListHeader key="filters" />,
		]}
		>
			{data.results.length > 0 ? (
				<ul className={styles.list}>
					{data.results.map(item => (
						<ValidationsDetailResultListItem
							key={item.id}
							isSelected={data.selected?.id === item.id}
							item={item}
							onSelect={actions.select}
						/>
					))}
				</ul>
			) : (
				<NoDataLabel text={t('gtfs_validations:detail.ValidationsDetailResultsList.empty')} />
			)}
		</Pane>
	);
}
