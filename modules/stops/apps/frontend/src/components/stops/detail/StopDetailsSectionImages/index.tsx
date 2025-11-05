'use client';

/* * */

import { UploadImage } from '@/components/Common/UploadImage';
import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Collapsible, Section } from '@go/ui';

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
