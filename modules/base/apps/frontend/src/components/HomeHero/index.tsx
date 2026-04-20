/* * */

import { VehicleBackground } from '@/components/VehicleBackground';
import { IconBolt, IconBook } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import Link from 'next/link';

import styles from './styles.module.css';

/* * */

export function HomeHero() {
	return (
		<section className={styles.container}>
			<div className={styles.heroContainer}>

				<VehicleBackground />

				<h1 className={styles.title}>
					Informação em
					{' '}<span className={styles.titleBrand}>tempo real</span>
					{' '}para operações de transporte público mais eficientes.
				</h1>
				<p className={styles.description}>APIs, links, guias e recursos para a rede de transportes públicos da Área Metropolitana de Lisboa.</p>

				<div className={styles.buttonsContainer}>
					<Link className={styles.button} href="/reference">
						<IconBook size={20} />
						Documentação
					</Link>
					<Link className={styles.button} href={PAGE_ROUTES.auth.LOGIN_LIST}>
						<IconBolt size={20} />
						Login
					</Link>
				</div>

				<Link className={styles.gforms} href={PAGE_ROUTES.auth.LOGIN_LIST} target="_blank">
					Receber atualizações por email
				</Link>

			</div>
		</section>
	);
}
