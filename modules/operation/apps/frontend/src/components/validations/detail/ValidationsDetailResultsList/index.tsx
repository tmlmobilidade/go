'use client';

import { ValidationsDetailResultListItem } from '@/components/validations/detail/ValidationsDetailResultListItem';
import { useValidationsDetailResultsContext } from '@/components/validations/detail/ValidationsDetailResults.context';
import { Label, NoDataLabel, Pane, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

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
			<Section key="header" alignItems="center" flexDirection="row" flexWrap="wrap" gap="xs" justifyContent="space-between">
				<Label>{t('gtfs_validations:detail.ValidationsDetailResultsList.title')}</Label>
			</Section>,
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
