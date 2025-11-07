/* * */

import { IconFileCheck } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';

import styles from './page.module.css';

/* * */

export default function Page() {
	return (
		<div className={styles.container}>
			<IconFileCheck size={100} />
			<h2>Validar um plano GTFS</h2>
			<ol>
				<li>
					<h3>Validar o ficheiro GTFS</h3>
					Clique no botão <strong>Nova validação</strong> para iniciar a carregar um plano GTFS.
				</li>
				<li>
					<h3>Aguardar o resultado da validação</h3>
					O sistema analisará o ficheiro e indicará se está <strong>válido</strong> ou se existem <strong>erros a corrigir</strong>.
				</li>
				<li>
					<h3>Converter GTFS em plano</h3>
					Após uma <strong>validação bem-sucedida</strong>, será possível converter a validação num <a href={PAGE_ROUTES.plans.PLANS_LIST}>plano</a>.
				</li>
			</ol>
		</div>
	);
}
