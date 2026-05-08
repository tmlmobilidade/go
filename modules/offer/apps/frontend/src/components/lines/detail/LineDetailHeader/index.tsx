'use client';

import { LineTag } from '@/components/common/LineTag';
import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { IconUpload } from '@tabler/icons-react';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { Button, CloseButton, DeleteButton, LockButton, Toolbar } from '@tmlmobilidade/ui';
import { keepUrlParams } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

export function LineDetailHeader() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const lineDetailContext = useLineDetailContext();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(keepUrlParams(PAGE_ROUTES.offer.LINES_LIST));
	};

	//
	// C. Render components

	return (
		<Toolbar>

			<CloseButton onClick={handleClose} type="close" />

			<div style={{ width: '100%' }}>
				<LineTag line_id={lineDetailContext.data.line._id} />
			</div>

			<LockButton
				isDisabled={!lineDetailContext.flags.canLock}
				isLocked={lineDetailContext.data.line.is_locked}
				onClick={lineDetailContext.actions.lock}
			/>

			<Button
				disabled={!lineDetailContext.flags.canSave}
				icon={<IconUpload size={28} />}
				label="Guardar"
				loading={lineDetailContext.flags.isSaving}
				onClick={lineDetailContext.actions.save}
				variant="primary"
			/>

			<DeleteButton
				confirmMessage="Tem a certeza que deseja apagar esta linha? Esta ação não pode ser revertida."
				confirmTitle="Apagar Linha"
				isDisabled={!lineDetailContext.flags.canDelete}
				onDelete={lineDetailContext.actions.delete}
				showConfirmation
			/>

		</Toolbar>
	);

	//
}
