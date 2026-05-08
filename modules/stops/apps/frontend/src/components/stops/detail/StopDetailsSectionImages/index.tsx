'use client';

import { UploadImage } from '@/components/common/UploadImage';
import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { Collapsible, Section } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionImages() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Suportes visuais."
			title="Imagens"
		>
			{/* <Section>
				<UploadImage
					imageUrl={stopDetailContext.data.imageUrl}
					label="Imagem"
					onDelete={stopDetailContext.actions.deleteImage}
					onFileChange={stopDetailContext.actions.fileChanged}
				/>
			</Section> */}
		</Collapsible>
	);

	//
}
