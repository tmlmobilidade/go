import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { IconFileCertificate } from '@tabler/icons-react';

import styles from './page.module.css';

/* * */

export default function Page() {
	return (
		<div className={styles.container}>
			<IconFileCertificate size={100} />
			<h2>Como criar um plano GTFS</h2>
			<ol>
				<li>
					<h3>Validar o ficheiro GTFS</h3>
					Aceda a este <a href={PAGE_ROUTES.plans.VALIDATIONS_LIST}>link</a> e faça o upload do seu ficheiro GTFS para iniciar a validação.
				</li>
				<li>
					<h3>Aguardar o resultado da validação</h3>
					O sistema analisará o ficheiro e indicará se está <strong>válido</strong> ou se existem <strong>erros a corrigir</strong>.
				</li>
				<li>
					<h3>Converter GTFS em plano</h3>
					Após uma <strong>validação bem-sucedida</strong>, será possível converter a validação num plano.
				</li>
			</ol>
		</div>
	);
}
