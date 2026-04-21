'use client';

/* * */

import { useAlertDetailPublicContext } from '@/contexts/AlertPublicDetail.context';
import { Description, Label } from '@tmlmobilidade/ui';
import Image from 'next/image';

import styles from './styles.module.css';

/* * */

export function AlertPublicDetailBody() {
	//
	// A. Setup variables

	const alertDetailPublicContext = useAlertDetailPublicContext();

	//
	// B. Render components

	return (
		<>
			<Label caps={true} size="sm">Descrição</Label>
			<Description>{alertDetailPublicContext.data.alert?.description}</Description>
			{alertDetailPublicContext.data.image?.url && <Image alt={alertDetailPublicContext.data.alert?.title} className={styles.image} height={300} src={alertDetailPublicContext.data.image.url} width={400} />}
		</>
	);

	//
}
