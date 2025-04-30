'use client';

/* * */

import Header from '@/components/common/Header';
import { TextArea } from '@tmlmobilidade/ui';

/* * */

import styles from '../styles.module.css';

/* * */

interface ObservationsProps {
	observations: string
}

export default function Observations({ observations }: ObservationsProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Texto livre para informações adicionais."
				title="Observações"
			/>

			<TextArea
				className={styles.text_area}
				maxRows={10}
				minRows={4}
				placeholder="Construção planeada a..."
				value={observations}
				// {...alertDetailData.form.getInputProps('description')}
			/>
		</div>
	);
}
