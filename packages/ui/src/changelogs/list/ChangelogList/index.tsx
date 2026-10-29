'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Pane } from '../../../components/panes/Pane';
import { ChangelogDetail } from '../../detail/ChangelogDetail';
import { ChangelogDetailHeader } from '../../detail/ChangelogDetailHeader';
import { useChangelogDetailData } from '../../detail/use-changelog-detail-data';
import { ChangelogFeedback } from '../../shared/ChangelogFeedback';
import { ChangelogListHeader } from '../ChangelogListHeader';
import { ChangelogListItem } from '../ChangelogListItem';
import { useChangelogListData } from '../use-changelog-list-data';

/* * */

interface ChangelogListProps {
	onClose: () => void
}

/* * */

export function ChangelogList({ onClose }: ChangelogListProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const [releaseId, setReleaseId] = useState<null | string>(null);
	const list = useChangelogListData();
	const detail = useChangelogDetailData(releaseId);
	const scrollRef = useRef<HTMLDivElement>(null);
	const listScrollTop = useRef(0);
	const lastCardId = useRef<null | string>(null);

	//
	// B. Handle navigation

	const handleOpen = (id: string) => {
		listScrollTop.current = scrollRef.current?.scrollTop ?? 0;
		lastCardId.current = id;
		setReleaseId(id);
		list.markSeen(id);
	};

	useEffect(() => {
		const container = scrollRef.current;
		if (!container) return;
		container.scrollTop = releaseId ? 0 : listScrollTop.current;
		if (releaseId) container.closest('[role="dialog"]')?.querySelector<HTMLButtonElement>('[data-back] button')?.focus();
		else if (lastCardId.current) {
			const card = Array.from(container.querySelectorAll<HTMLElement>('[data-release-id]')).find(element => element.dataset.releaseId === lastCardId.current);
			card?.querySelector('button')?.focus({ preventScroll: true });
		}
	}, [releaseId]);

	//
	// C. Render components

	const header = releaseId
		? <ChangelogDetailHeader key="header" onBack={() => setReleaseId(null)} onClose={onClose} />
		: <ChangelogListHeader key="header" count={list.unreadCount} isLoading={list.isLoading || !!list.error} isMarkingRead={list.isMarkingRead} onClose={onClose} onMarkAllRead={list.markAllRead} />;

	return (
		<Pane header={[header]}>
			<div ref={scrollRef} className={styles.root}>
				{releaseId ? (
					<>
						{detail.isLoading && <ChangelogFeedback isLoading />}
						{detail.error && <ChangelogFeedback onRetry={detail.retry} isError />}
						{!detail.error && detail.data && <ChangelogDetail release={detail.data} />}
					</>
				) : (
					<>
						<p className={styles.subtitle}>{t('shared:components.changelog.subtitle')}</p>
						{list.isLoading && <ChangelogFeedback isLoading />}
						{!list.isLoading && !list.error && !list.data.length && <ChangelogFeedback />}
						<ul className={styles.list}>
							{list.data.map(release => <ChangelogListItem key={release._id} onOpen={() => handleOpen(release._id)} release={release} />)}
						</ul>
						{list.error && <ChangelogFeedback onRetry={list.retry} isError />}
					</>
				)}
			</div>
		</Pane>
	);
}
