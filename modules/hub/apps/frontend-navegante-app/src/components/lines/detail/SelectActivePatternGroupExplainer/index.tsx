/* * */

import { IconZoomQuestionFilled } from '@tabler/icons-react';
import { Modal } from '@tmlmobilidade/ui';
import { useDisclosure } from '@tmlmobilidade/ui';
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
			<Modal onClose={closeModal} opened={modalIsOpen} title={t('default:lines.SelectActivePatternGroupExplainer.title')}>
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
