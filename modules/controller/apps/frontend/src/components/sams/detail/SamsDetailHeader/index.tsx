'use client';

import { useSamsDetailContext } from '@/contexts/SamsDetail.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { CloseButton, IdTag, keepUrlParams, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function SamsDetailHeader() {
	//
	// A. Setup variables

	const router = useRouter();
	const samDetailContext = useSamsDetailContext();

	//
	// B. Handle actions

	const handleGoBack = () => {
		router.push(keepUrlParams(PAGE_ROUTES.controller.SAMS_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleGoBack} type="close" />
			<IdTag id={samDetailContext.data.sam?._id} copyOnClick />
		</Toolbar>
	);
}
