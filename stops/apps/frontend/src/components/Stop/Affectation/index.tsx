'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import styles from '../styles.module.css';

/* * */

const comboBoxValues = ['AML', 'Alcochete'];

/* * */

interface AffectationProps {
	affectation: object
}

export default function Affectation({ affectation }: AffectationProps) {
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
				<Item
					comboBoxValues={comboBoxValues}
					hasMultiple={true}
					inputProps={affectation}
					isComboBox={true}
					label="Aceitação de Passes pré-definida"
					placeholder="Escolha uma opção..."
				/>
			</Row>
		</div>
	);
}
