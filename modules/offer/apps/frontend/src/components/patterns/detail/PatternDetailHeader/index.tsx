'use client';

/* * */

import { OfferBreadcrumbs } from '@/components/common/OfferBreadcrumbs';
import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { PatternDetailHistory } from '@/components/patterns/detail/PatternDetailHistory';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, keepUrlParams, LockButton, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function PatternDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const patternDetailContext = usePatternDetailContext();

	//
	// B. Handle actions

	const handleGoBack = () => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.ROUTE_DETAIL(patternDetailContext.data.pattern.line_id, patternDetailContext.data.pattern.route_id)));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleGoBack} type="back" />

			<div style={{ width: '100%' }}>
				<OfferBreadcrumbs
					items={{
						lineId: patternDetailContext.data.pattern.line_id,
						patternId: patternDetailContext.data.pattern._id,
						routeId: patternDetailContext.data.pattern.route_id,
					}}
				/>
			</div>

			<PatternDetailHistory />

			<LockButton
				isDisabled={!patternDetailContext.flags.canLock}
				isLocked={patternDetailContext.data.pattern.is_locked}
				onClick={patternDetailContext.actions.lock}
			/>

			<Button
				disabled={!patternDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={patternDetailContext.flags.isSaving}
				onClick={patternDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage="Tem a certeza que deseja apagar este Pattern? Esta ação não pode ser revertida."
				confirmTitle="Apagar Pattern"
				isDisabled={!patternDetailContext.flags.canDelete}
				onDelete={patternDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
