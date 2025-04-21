'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import styles from '../styles.module.css';

/* * */

export default function Affectation({ affectation }: { affectation: string[] }) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Configuração dos passes aceites por esta paragem. É possível alterar estas definições para cada pattern."
				title="Afetação"
			/>

			<Row>
				<Item label="Aceitação de Passes pré-definida" placeholder="Escolha uma opção..." value={affectation.toString()} />
			</Row>
		</div>
	);
}
