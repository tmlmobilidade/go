'use client';

/* * */

import Header from '@/components/common/Header';

/* * */

import styles from '../styles.module.css';

/* * */

interface MediaProps {
	file_ids: string[]
	image_ids: string[]
}

export default function Media({ file_ids, image_ids }: MediaProps) {
	//

	//
	// A. Render components

	return (
		<div className={styles.section}>
			<Header
				description="Suportes visuais."
				title="Imagens & Vídeos"
			/>

			{file_ids.map(file_id => <div key={file_id}>{file_id}</div>)}

			{image_ids.map(image_id => <div key={image_id}>{image_id}</div>)}
		</div>
	);
}
