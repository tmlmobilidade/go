'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type Banner, BannerSchema, type UpdateBannerDto, UpdateBannerSchema } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch, useToast } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useBannersListData } from '../list/use-banners-list-data';
import { useBannersDetailData } from './use-banners-detail-data';
import { useBannersDetailId } from './use-banners-detail-id';

/* * */

interface BannersDetailFormContextValue extends StandardFormContextValue<UpdateBannerDto> {
	data: Banner | null
	error: null | string
	publication: { can_publish: boolean, change: (action: 'archive' | 'publish' | 'unpublish') => void, is_busy: boolean }
}

/* * */

const BannersDetailFormContext = createContext<BannersDetailFormContextValue | undefined>(undefined);

/* * */

export function useBannersDetailFormContext() {
	//

	const value = useContext(BannersDetailFormContext);
	if (!value) throw new Error('useBannersDetailFormContext must be used within its provider');

	return value;
}

/* * */

export function BannersDetailFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const router = useRouter();
	const { id } = useBannersDetailId();
	const { data: me } = useMeData();
	const { data, error, isLoading, mutate } = useBannersDetailData();
	const { mutate: mutateList } = useBannersListData();
	const catalog = PermissionCatalog.all.banners;
	const canDelete = PermissionCatalog.hasPermission(me?.permissions ?? [], catalog.scope, catalog.actions.delete);
	const canUpdate = PermissionCatalog.hasPermission(me?.permissions ?? [], catalog.scope, catalog.actions.update);

	//
	// B. Set up validation and unsaved-change protection

	const { form, isDirty, unblock } = useStandardForm<UpdateBannerDto, typeof UpdateBannerSchema>({
		apiData: data,
		defaultValues: {
			dismissible: false,
			ends_at: null,
			kind: 'maintenance',
			link: null,
			message: '',
			scope: { type: 'platform' },
			severity: 'info',
			starts_at: null,
			title: '',
		},
		schema: UpdateBannerSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Errors recorded before the first save attempt are not re-validated on change, so validate current values instead.
	const isValid = UpdateBannerSchema.safeParse(values).success;

	//
	// C. Save content or change publication state

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: () =>
			fetchApiData<Banner>({
				body: UpdateBannerSchema.parse(form.getValues()),
				method: 'PUT',
				url: API_ROUTES.core.BANNERS_DETAIL(id),
			}),
		onSuccess: (response) => {
			form.reset(response.data);
			mutate(response);
			mutateList();
		},
	});
	const { action: handlePublication, isLoading: isPublishing } = useHandleAction<Banner, 'archive' | 'publish' | 'unpublish'>({
		fetchFn: action =>
			fetchApiData<Banner>({
				body: { publish_status: ({ archive: 'archived', publish: 'published', unpublish: 'draft' } as const)[action] },
				method: 'PUT',
				url: API_ROUTES.core.BANNERS_DETAIL(id),
			}),
		onSuccess: (response) => {
			form.reset(response.data);
			mutate(response);
			mutateList();
		},
	});

	const { action: handleDelete, isLoading: isDeleting } = useHandleAction({
		fetchFn: () => fetchApiData<undefined>({ method: 'DELETE', url: API_ROUTES.core.BANNERS_DETAIL(id) }),
		onSuccess: () => {
			form.reset();
			unblock();
			mutateList();
			router.push(keepUrlParams(PAGE_ROUTES.core.DEV_BANNERS_LIST));
		},
	});

	//
	// D. Derive editing capabilities

	const isBusy = isUpdating || isPublishing || isDeleting;

	const capabilities = useStandardFormCapabilities({
		delete: { hasPermission: canDelete, isDeleting },
		form: { isDirty, isValid },
		loading: { isLoading: isLoading || isBusy },
		locked: { isLocked: data?.is_locked },
		update: { hasPermission: canUpdate, isUpdating: isBusy },
	});

	const changePublication = useCallback(
		(action: 'archive' | 'publish' | 'unpublish') => {
			if (!canUpdate || isDirty || isBusy || !data || data.is_locked) return;
			if (action === 'publish' && !BannerSchema.safeParse({ ...data, publish_status: 'published' }).success) {
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
			actions: {
				delete: () => {
					if (capabilities.deleteEnabled) void handleDelete();
				},
				update: () => form.handleSubmit(() => handleUpdate())(),
			},
			capabilities: { ...capabilities, editEnabled: capabilities.editEnabled && canUpdate },
			data,
			error,
			form,
			isDirty,
			isValid,
			publication: { can_publish: canUpdate, change: changePublication, is_busy: isBusy },
			status: { isDeleting, isLoading, isLocked: data?.is_locked, isUpdating: isUpdating },
			unblock,
		}),
		[canUpdate, capabilities, changePublication, data, error, form, handleDelete, handleUpdate, isBusy, isDeleting, isDirty, isLoading, isUpdating, isValid, unblock],
	);

	return <BannersDetailFormContext.Provider value={value}>{children}</BannersDetailFormContext.Provider>;
}
