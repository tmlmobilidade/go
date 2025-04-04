'use client';

/* * */

import Header from '@/components/common/Header';
import { TextArea } from '@tmlmobilidade/ui';

/* * */

import styles from '../styles.module.css';

/* * */

export default function Comments() {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Texto livre para informações adicionais."
				title="Notas e Comentários"
			/>

			<TextArea
				className={styles.text_area}
				maxRows={10}
				minRows={4}
				placeholder="Construção planeada a..."
				// {...alertDetailData.form.getInputProps('description')}
			/>
		</div>
	);
}
