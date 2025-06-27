'use client';

/* * */

import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { IconCaretLeftFilled, IconRefreshDot } from '@tabler/icons-react';
import { Button, Spacer, Tag } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function RidesDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const ridesDetailContext = useRidesDetailContext();

	//
	// B. Handle actions

	const handleGoBack = () => {
		router.push(`/`);
	};

	//
	// C. Render components

	return (
		<>
			<Button icon={<IconCaretLeftFilled />} label="Voltar" onClick={handleGoBack} variant="muted" />
			<Tag label={ridesDetailContext.data.ride_id} variant="muted" />
			<Spacer />
			<Button icon={<IconRefreshDot />} label="Reprocessar" />
		</>
	);

	//
}
