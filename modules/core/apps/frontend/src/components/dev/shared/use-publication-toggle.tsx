'use client';

import { type PublishStatus } from '@tmlmobilidade/go-types-shared';
import { Button, closeModal, Label, openModal, Section } from '@tmlmobilidade/ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

type PublicationAction = 'archive' | 'publish' | 'unpublish';

/* * */

const STATUS_ACTIONS: Record<PublishStatus, PublicationAction> = {
	archived: 'archive',
	draft: 'unpublish',
	published: 'publish',
};

/* * */

interface UsePublicationToggleParams {
	canPublishContent: boolean
	kind: 'banners' | 'changelog'
	onAction: (action: PublicationAction) => void
	status?: PublishStatus
}

/* * */

/**
 * Turns a status tag selection into a confirmed publication action.
 * Incomplete content skips the confirmation so `onAction` can surface the validation errors.
 */
export function usePublicationToggle({ canPublishContent, kind, onAction, status }: UsePublicationToggleParams) {
	//

	const { t } = useTranslation();

	return useCallback((value: PublishStatus) => {
		if (value === status) return;
		const action = STATUS_ACTIONS[value];
		if (action === 'publish' && !canPublishContent) return onAction(action);
		const modalId = 'dev-publication-confirm';
		openModal({
			children: (
				<Section gap="md">
					<Label>{t(`default:dev.confirm.${action}`)}</Label>
					<Section flexDirection="row" gap="sm" padding="none">
						<Button label={t('default:dev.actions.cancel')} onClick={() => closeModal(modalId)} variant="secondary" />
						<Button
							label={t(`default:dev.${kind}.${action}`)}
							variant={action === 'archive' ? 'danger' : 'primary'}
							onClick={() => {
								closeModal(modalId);
								onAction(action);
							}}
						/>
					</Section>
				</Section>
			),
			modalId,
			title: t(`default:dev.${kind}.${action}`),
		});
	}, [canPublishContent, kind, onAction, status, t]);
}
