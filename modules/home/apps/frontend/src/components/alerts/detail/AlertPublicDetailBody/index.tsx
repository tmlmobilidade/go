'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { Description, Label } from '@tmlmobilidade/ui';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

export function AlertPublicDetailBody() {
	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

	//
	// B. Render components

	return (
		<>
			<Label caps={true} size="sm">Descrição</Label>
			<Description>{alertDetailContext.data.alert?.description}</Description>
			{alertDetailContext.data.image?.url && <Image alt={alertDetailContext.data.alert?.title} className={styles.image} height={300} src={alertDetailContext.data.image.url} width={400} />}
		</>
	);

	//
}
