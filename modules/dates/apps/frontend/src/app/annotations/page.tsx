import { IconNote } from '@tabler/icons-react';

import styles from './page.module.css';

/* * */

export default function Page() {
	return (
		<div className={styles.container}>
			<IconNote size={100} />
			<h2>Selecione uma ocorrência</h2>
		</div>
	);
}
