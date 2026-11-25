'use client';

import { ValidationsDetailResultRows } from '@/components/validations/detail/ValidationsDetailResultRows';
import { type GtfsValidationOutputMessage } from '@tmlmobilidade/go-types-gtfs-validator';
import { Surface, Table } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface ValidationsDetailResultMessagesProps {
	description: string
	messages: GtfsValidationOutputMessage[]
	onShowAll: () => void
	showAll: boolean
}

const VISIBLE_MESSAGES_LIMIT = 10;

/* * */

export function ValidationsDetailResultMessages({ description, messages, onShowAll, showAll }: ValidationsDetailResultMessagesProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const visibleMessages = showAll ? messages : messages.slice(0, VISIBLE_MESSAGES_LIMIT);
	const hiddenMessageCount = messages.length - visibleMessages.length;

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<Surface overflow="auto" variant="bordered">
				<Table aria-label={description} className={styles.table}>
					<Table.Thead>
						<Table.Tr>
							<Table.Th scope="col">{t('validations:detail.ValidationsDetailResultMessages.message')}</Table.Th>
							<Table.Th className={styles.rowsColumn} scope="col">{t('validations:detail.ValidationsDetailResultMessages.rows')}</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>
						{visibleMessages.map((message, index) => (
							<Table.Tr key={index}>
								<Table.Td className={styles.message}>{message.message}</Table.Td>
								<Table.Td><ValidationsDetailResultRows rows={message.rows} /></Table.Td>
							</Table.Tr>
						))}
					</Table.Tbody>
				</Table>
			</Surface>
			{hiddenMessageCount > 0 && (
				<button className={styles.showAll} onClick={onShowAll} type="button">
					{t('validations:detail.ValidationsDetailResultMessages.show_all', '', { count: hiddenMessageCount })}
				</button>
			)}
		</div>
	);

	//
}
