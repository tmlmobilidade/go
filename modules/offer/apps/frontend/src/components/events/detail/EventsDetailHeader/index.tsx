'use client';

import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { CloseButton, DeleteButton, HasPermission, IdTag, keepUrlParams, Label, LockButton, Spacer, Toolbar, UpdateButton, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useEventsDetailFormContext } from '../EventsDetailForm.context';
import { EventsDetailPatternsMenu } from '../EventsDetailPatternsMenu';
import { useEventsDetailData } from '../use-events-detail-data';
import { useEventsDetailEventId } from '../use-events-detail-event-id';

/* * */

export function EventsDetailHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { actions, capabilities, form, status } = useEventsDetailFormContext();
	const title = useStandardFormWatch({ control: form.control, name: 'title' });
	const router = useRouter();
	const { eventId } = useEventsDetailEventId();
	const { data } = useEventsDetailData();
	const close = () => router.push(keepUrlParams(PAGE_ROUTES.offer.EVENTS_LIST));

	//
	// B. Render components

	return (
		<Toolbar>
			<CloseButton onClick={close} type="close" />
			<IdTag id={eventId} copyOnClick />
			<Label size="lg" singleLine>{title}</Label>
			<Spacer />
			<EventsDetailPatternsMenu patterns={data?.associated_patterns} />
			<HasPermission action={PermissionCatalog.all.events.actions.lock} scope={PermissionCatalog.all.events.scope}>
				<LockButton isDisabled={!capabilities.lockEnabled} isLoading={status.isLocking} isLocked={!!status.isLocked} onClick={actions.lock} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.events.actions.update} scope={PermissionCatalog.all.events.scope}>
				<UpdateButton isDisabled={!capabilities.updateEnabled} isLoading={status.isUpdating} onClick={actions.update} />
			</HasPermission>
			<HasPermission action={PermissionCatalog.all.events.actions.delete} scope={PermissionCatalog.all.events.scope}>
				<DeleteButton cancelLabel={t('default:events.detail.cancel')} confirmLabel={t('default:events.detail.confirm')} confirmMessage={t('default:events.detail.confirmMessage')} confirmTitle={t('default:events.detail.confirmTitle')} isDisabled={!capabilities.deleteEnabled} isLoading={status.isDeleting} onDelete={actions.delete} showConfirmation />
			</HasPermission>
		</Toolbar>
	);

	//
}
