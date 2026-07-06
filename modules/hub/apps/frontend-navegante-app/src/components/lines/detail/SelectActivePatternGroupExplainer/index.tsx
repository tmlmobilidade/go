/* * */

import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconZoomQuestionFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function SelectActivePatternGroupExplainer() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const [modalIsOpen, { close: closeModal, open: openModal }] = useDisclosure(false);

	//
	// B. Render components

	return (
		<>
			<Modal onClose={closeModal} opened={modalIsOpen} title="Explicação">
				{/* * */}
			</Modal>
			<div className={styles.explainer} onClick={openModal}>
				<IconZoomQuestionFilled size={16} />
				{/* {t('')} */}
			</div>
		</>
	);

	//
}
