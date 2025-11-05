/* * */

import { type WikiArticle } from '@tmlmobilidade/go-types';
import { BackButton, Label, Spacer, TagGroup } from '@tmlmobilidade/ui';
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
		router.push('/');
	};

	//
	// C. Render components

	return (
		<>
			<BackButton onClick={handleClose} />
			<Label size="lg" singleLine>{data.title}</Label>
			<Spacer />
			<TagGroup limit={10} tags={data.tags.map(tag => ({ label: tag, variant: 'secondary' }))} />
		</>
	);

	//
}
