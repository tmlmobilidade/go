'use client';

import { CloseButton, Label, Toolbar } from '@tmlmobilidade/ui';
/* * */

export function StopsExtractHeader({ onClose, title }: { onClose: () => void, title: string }) {
	return (
		<Toolbar>
			<CloseButton onClick={onClose} type="close" />
			<Label size="lg" singleLine>{title}</Label>
		</Toolbar>
	);
}
