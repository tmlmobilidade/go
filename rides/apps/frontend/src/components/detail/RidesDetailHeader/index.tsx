'use client';

/* * */

import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { IconRefreshDot } from '@tabler/icons-react';
import { BackButton, Button, Spacer, Tag } from '@tmlmobilidade/ui';
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
		router.push('/rides');
	};

	//
	// C. Render components

	return (
		<>
			<BackButton onClick={handleGoBack} type="close" />
			<Tag label={ridesDetailContext.data.ride_id} variant="muted" />
			<Spacer />
			<Button icon={<IconRefreshDot />} label="Reprocessar" />
		</>
	);

	//
}
