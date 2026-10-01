'use client';

import { BottomSheet } from '@/components/common/bottom-sheet/ReactModalSheet';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { useHelpDetailData } from '@/components/help/use-help-detail-data';
import { Accordion } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function HelpDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	//
	// B. Fetch data

	const { data: allFaqsData, isLoading: allFaqsLoading } = useHelpDetailData();

	//
	// C. Render components

	return (
		<BottomSheet
			onClose={closeActiveBottomSheet}
			opened={activeBottomSheet?.view === 'help'}
			title={t('default:help.HelpDetail.title')}
		>

			{!allFaqsLoading && !allFaqsData && (
				<NoDataLabel text={t('default:help.HelpDetail.no_data')} withMinHeight />
			)}

			{!allFaqsLoading && allFaqsData?.length > 0 && (
				<Accordion chevronPosition="right" classNames={{ control: styles.accordionControl, item: styles.accordionItem, label: styles.accordionLabel, root: styles.accordionRoot }} variant="separated">
					{[...allFaqsData].sort((a, b) => a._order.localeCompare(b._order)).map(faq => (
						<Accordion.Item key={faq.id} value={faq.id}>
							<Accordion.Control>{faq.question}</Accordion.Control>
							<Accordion.Panel>
								<p className={styles.text}>{faq.answer}</p>
							</Accordion.Panel>
						</Accordion.Item>
					))}
				</Accordion>
			)}

		</BottomSheet>
	);
}
