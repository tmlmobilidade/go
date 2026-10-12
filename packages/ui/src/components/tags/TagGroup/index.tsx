/* * */

import { useMemo } from 'react';

import styles from './styles.module.css';

import { Label } from '../../display/Label';
import { ValueDisplay } from '../../display/ValueDisplay';
import { type SurfaceProps } from '../../layout';
import { Tag, type TagProps } from '../Tag';

/* * */

export interface TagGroupProps {
	elevated?: SurfaceProps['elevated']
	label?: string
	limit?: number
	tags: TagProps[]
	variant?: SurfaceProps['variant']
	wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
}

/* * */

export function TagGroup({ elevated, label, limit = 2, tags = [], variant = 'bordered', wrap = 'nowrap' }: TagGroupProps) {
	//

	//
	// A. Transform data

	const slicedTags = useMemo(() => {
		if (!tags?.length) return [];
		return tags.slice(0, limit);
	}, [tags, limit]);

	const remainingTagCount = useMemo(() => {
		if (!tags?.length) return 0;
		return tags.length - slicedTags.length;
	}, [tags, slicedTags]);

	//
	// B. Render components

	const content = (
		<div className={styles.container} data-wrap={wrap}>
			{slicedTags.map((props, index) => (
				<Tag key={index} {...props} />
			))}
			{remainingTagCount > 0 && (
				<Label>+{remainingTagCount}</Label>
			)}
		</div>
	);

	if (label === undefined) return content;

	return <ValueDisplay elevated={elevated} label={label} value={content} variant={variant} />;

	//
}
