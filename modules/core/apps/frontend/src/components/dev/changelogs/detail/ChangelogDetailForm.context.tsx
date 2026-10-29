'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Changelog, ChangelogSchema, type UpdateChangelogDto, UpdateChangelogSchema } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChangelogListData } from '../list/use-changelog-list-data';
import { useChangelogDetailData } from './use-changelog-detail-data';
import { useChangelogDetailId } from './use-changelog-detail-id';

/* * */

interface ChangelogDetailFormContextValue extends StandardFormContextValue<UpdateChangelogDto> {
	data: Changelog | null
	error: null | string
	publication: { can_publish: boolean, change: (action: 'archive' | 'publish' | 'unpublish') => void, is_busy: boolean }
}

/* * */

const ChangelogDetailFormContext = createContext<ChangelogDetailFormContextValue | undefined>(undefined);

/* * */

export function useChangelogDetailFormContext() {
	//

	const value = useContext(ChangelogDetailFormContext);
	if (!value) throw new Error('useChangelogDetailFormContext must be used within its provider');

	return value;
}

/* * */

export function ChangelogDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { id } = useChangelogDetailId();
	const { data: me } = useMeData();
	const { data, error, isLoading, mutate } = useChangelogDetailData();
	const { mutate: mutateList } = useChangelogListData();
	const catalog = PermissionCatalog.all.changelogs;
	const canUpdate = PermissionCatalog.hasPermission(me?.permissions ?? [], catalog.scope, catalog.actions.update);

	//
	// B. Set up validation and unsaved-change protection

	const { form, isDirty, unblock } = useStandardForm<UpdateChangelogDto, typeof UpdateChangelogSchema>({
		apiData: data,
		defaultValues: { items: [], scope: { type: 'platform' }, summary: '', title: '' },
		schema: UpdateChangelogSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Errors recorded before the first save attempt are not re-validated on change, so validate current values instead.
	const isValid = UpdateChangelogSchema.safeParse(values).success;

	//
	// C. Save content or change publication state

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: () =>
			fetchApiData<Changelog>({
				body: UpdateChangelogSchema.parse(form.getValues()),
				method: 'PUT',
				url: API_ROUTES.core.CHANGELOGS_DETAIL(id),
			}),
		onSuccess: (response) => {
			form.reset(response.data);
			mutate(response);
			mutateList();
		},
	});
	const { action: handlePublication, isLoading: isPublishing } = useHandleAction<Changelog, 'archive' | 'publish' | 'unpublish'>({
		fetchFn: action =>
			fetchApiData<Changelog>({
				body: { publish_status: ({ archive: 'archived', publish: 'published', unpublish: 'draft' } as const)[action] },
				method: 'PUT',
				url: API_ROUTES.core.CHANGELOGS_DETAIL(id),
			}),
		onSuccess: (response) => {
			form.reset(response.data);
			mutate(response);
			mutateList();
		},
	});

	//
	// D. Derive editing capabilities

	const isBusy = isUpdating || isPublishing;

	const capabilities = useStandardFormCapabilities({
		form: { isDirty, isValid },
		loading: { isLoading: isLoading || isBusy },
		locked: { isLocked: data?.is_locked || !canUpdate },
		update: { hasPermission: canUpdate, isUpdating: isBusy },
	});

	const changePublication = useCallback(
		(action: 'archive' | 'publish' | 'unpublish') => {
			if (!canUpdate || isDirty || isBusy || !data || data.is_locked) return;
			if (
				action === 'publish' &&
				!ChangelogSchema.safeParse({ ...data, publish_status: 'published' })
					.success
			) {
				useToast.warning({ message: t('default:dev.hints.incomplete') });
				return;
			}
			handlePublication(action);
		},
		[canUpdate, data, handlePublication, isBusy, isDirty, t],
	);

	//
	// E. Expose form state

	const value = useMemo(
		() => ({
			actions: { update: () => form.handleSubmit(() => handleUpdate())() },
			capabilities,
			data,
			error,
			form,
			isDirty,
			isValid,
			publication: { can_publish: canUpdate, change: changePublication, is_busy: isBusy },
			status: { isLoading, isLocked: data?.is_locked, isUpdating: isUpdating },
			unblock,
		}),
		[canUpdate, capabilities, changePublication, data, error, form, handleUpdate, isBusy, isDirty, isLoading, isUpdating, isValid, unblock],
	);

	return <ChangelogDetailFormContext.Provider value={value}>{children}</ChangelogDetailFormContext.Provider>;
}
