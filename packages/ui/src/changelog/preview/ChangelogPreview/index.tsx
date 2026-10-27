'use client';

import { type ComponentProps } from 'react';

import styles from './styles.module.css';

import { CloseButton } from '../../../buttons/CloseButton';
import { Pane } from '../../../components/panes/Pane';
import { ListHeader } from '../../../layout/list-header/ListHeader';
import { ChangelogDetail } from '../../detail/ChangelogDetail';

/* * */

interface ChangelogPreviewProps {
	onClose: () => void
	release: ComponentProps<typeof ChangelogDetail>['release']
	title: string
}

/* * */

export function ChangelogPreview({ onClose, release, title }: ChangelogPreviewProps) {
	return (
		<Pane
			header={[
				<ListHeader key="header" actions={<CloseButton onClick={onClose} type="close" />} count={null} title={title} />,
			]}
		>
			<div className={styles.root}>
				<ChangelogDetail release={release} />
			</div>
		</Pane>
	);
}
