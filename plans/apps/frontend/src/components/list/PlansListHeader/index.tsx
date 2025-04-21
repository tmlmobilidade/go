/* * */

import { Routes } from '@/lib/routes';
import { IconPlus } from '@tabler/icons-react';
import { Button, Label, Spacer } from '@tmlmobilidade/ui';
import Link from 'next/link';

/* * */

export function PlansListHeader() {
	//

	//
	// A. Setup variables

	//
	// B. Render components

	return (
		<>
			<Label size="lg" caps>Planos</Label>
			<Spacer />
			<Link href={Routes.PLAN_DETAIL('new')}>
				<Button label="Novo plano" leftSection={<IconPlus size={20} />} />
			</Link>
		</>
	);

	//
}
