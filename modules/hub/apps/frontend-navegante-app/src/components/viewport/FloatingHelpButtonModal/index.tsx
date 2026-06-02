'use client';

import { NoDataLabel } from '@/components/layout/NoDataLabel';
import { useFaqsNavegante } from '@/hooks/use-faqs-navegante';
import { Accordion, Modal, ModalBody } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface FloatingHelpButtonModalProps {
	isOpen: boolean
	onClose: () => void
}

/* * */

export function FloatingHelpButtonModal({ isOpen, onClose }: FloatingHelpButtonModalProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { faqs, flags } = useFaqsNavegante();

	//
	// B. Render components

	return (
		<Modal
			classNames={{ body: styles.body, header: styles.header, title: styles.title }}
			closeButtonProps={{ icon: <IconX size={50} /> }}
			onClose={onClose}
			opened={isOpen}
			size="xl"
			title={t('default:viewport.FloatingHelpButton.modal.title')}
			fullScreen
		>
			<ModalBody>
				{!flags.isLoading && faqs.length === 0 && (
					<NoDataLabel text={t('default:viewport.FloatingHelpButton.modal.no_data')} withMinHeight />
				)}
				{!flags.isLoading && faqs.length > 0 && (
					<Accordion chevronPosition="right" classNames={{ control: styles.accordionItemControl, item: styles.accordionItem, label: styles.accordionItemControlLabel, root: styles.accordionRoot }} variant="separated">
						{faqs.map(faq => (
							<Accordion.Item key={faq.id} value={faq.id}>
								<Accordion.Control>{faq.question}</Accordion.Control>
								<Accordion.Panel>
									<p className={styles.accordionItemPanel}>{faq.answer}</p>
								</Accordion.Panel>
							</Accordion.Item>
						))}
					</Accordion>
				)}
			</ModalBody>
		</Modal>
	);
}
