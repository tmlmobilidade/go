'use client';

import { NoDataLabel } from '@/components/layout/NoDataLabel';
import { BottomSheet } from '@/components/viewport/BottomSheet';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
import { Accordion } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

export interface NaveganteFaq {
	answer: string
	id: string
	question: string
}

/* * */

export function HelpDetail() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { activeBottomSheet, closeActiveBottomSheet } = useBottomSheet();

	//
	// B. Fetch data

	const { data: allFaqsData, isLoading: allFaqsLoading } = useSWR<NaveganteFaq[], Error>({
		credentials: 'omit',
		url: 'https://carrismetropolitana.pt/admin/public-api/faqs-navegante',
		useProperApiResponse: false,
	});

	//
	// B. Render components

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
					{allFaqsData.map(faq => (
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
