/* * */

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type WikiArticle } from '@tmlmobilidade/types';
import { CloseButton, Label, Spacer, TagGroup, Toolbar } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';

/* * */

interface WikiDetailHeaderProps {
	data: WikiArticle
}

/* * */

export function WikiDetailHeader({ data }: WikiDetailHeaderProps) {
	//

	//
	// A. Setup variables

	const router = useRouter();

	//
	// B. Handle actions

	const handleClose = () => {
		router.push(PAGE_ROUTES.auth.HOME_LIST);
	};

	//
	// C. Render components

	return (
		<Toolbar>
			<CloseButton onClick={handleClose} />
			<Label size="lg" singleLine>{data.title}</Label>
			<Spacer />
			<TagGroup limit={10} tags={data.tags.map(tag => ({ label: tag, variant: 'secondary' }))} />
		</Toolbar>
	);

	//
}
