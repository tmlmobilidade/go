'use client';

import { translateValidationResult } from '@/components/validations/detail/translate-validation-result';
import { ValidationsDetailResultRows } from '@/components/validations/detail/ValidationsDetailResultRows';
import { type GtfsValidationOutputMessage } from '@tmlmobilidade/go-types-gtfs-validator';
import { NoDataLabel, Surface, Table } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface ValidationsDetailResultMessagesProps {
	description: string
	messages: GtfsValidationOutputMessage[]
	ruleId: string
}

const VISIBLE_MESSAGES_LIMIT = 10;

/* * */

export function GtfsValidationsDetailSelectedRuleMessages({ description, messages, ruleId }: ValidationsDetailResultMessagesProps) {
	//

	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const [showAll, setShowAll] = useState(false);

	//
	// B. Transform data

	const visibleMessages = showAll ? messages : messages.slice(0, VISIBLE_MESSAGES_LIMIT);
	const hiddenMessageCount = messages.length - visibleMessages.length;

	//
	// C. Render components

	return (
		<section className={styles.container}>
			<div>
				<h4>{t('gtfs_validations:detail.ValidationsDetailResultMessages.title')}</h4>
				<p>{t('gtfs_validations:detail.ValidationsDetailResultMessages.description')}</p>
			</div>
			{visibleMessages.length > 0 ? (
				<Surface overflow="auto" variant="bordered">
					<Table aria-label={description} className={styles.table}>
						<Table.Thead>
							<Table.Tr>
								<Table.Th scope="col">{t('gtfs_validations:detail.ValidationsDetailResultMessages.message')}</Table.Th>
								<Table.Th className={styles.rowsColumn} scope="col">{t('gtfs_validations:detail.ValidationsDetailResultMessages.rows')}</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{visibleMessages.map((message, index) => (
								<Table.Tr key={index}>
									<Table.Td className={styles.message}>{translateValidationResult(i18n, 'message', ruleId, message.translation, message.message)}</Table.Td>
									<Table.Td><ValidationsDetailResultRows rows={message.rows} /></Table.Td>
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Surface>
			) : (
				<NoDataLabel text={t('gtfs_validations:detail.ValidationsDetailResultMessages.empty')} />
			)}
			{hiddenMessageCount > 0 && (
				<button className={styles.showAll} onClick={() => setShowAll(true)} type="button">
					{t('gtfs_validations:detail.ValidationsDetailResultMessages.show_all', '', { count: hiddenMessageCount })}
				</button>
			)}
		</section>
	);

	//
}
