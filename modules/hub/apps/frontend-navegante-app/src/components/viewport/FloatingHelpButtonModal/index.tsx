'use client';

import { NoDataLabel } from '@/components/layout/NoDataLabel';
import { useFaqsNavegante } from '@/hooks/use-faqs-navegante';
import { Accordion, Modal, ModalBody } from '@mantine/core';
import { useTranslation } from 'react-i18next';

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
			onClose={onClose}
			opened={isOpen}
			size="lg"
			title={t('default:viewport.FloatingHelpButton.modal.title')}
		>
			<ModalBody>

				{!flags.isLoading && faqs.length === 0 && (
					<NoDataLabel text={t('default:viewport.FloatingHelpButton.modal.no_data')} withMinHeight />
				)}

				{!flags.isLoading && faqs.length > 0 && (
					<Accordion chevronPosition="right" variant="separated">
						{faqs.map(faq => (
							<Accordion.Item key={faq.id} value={faq.id}>
								<Accordion.Control>{faq.question}</Accordion.Control>
								<Accordion.Panel>
									<p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{faq.answer}</p>
								</Accordion.Panel>
							</Accordion.Item>
						))}
					</Accordion>
				)}
			</ModalBody>
		</Modal>
	);
}
