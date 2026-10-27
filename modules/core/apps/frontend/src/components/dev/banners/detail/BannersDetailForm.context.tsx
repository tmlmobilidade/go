'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type OperationalBanner, OperationalBannerSchema, type UpdateOperationalBannerDto, UpdateOperationalBannerSchema } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities, useStandardFormWatch, useToast } from '@tmlmobilidade/ui';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useBannersListData } from '../list/use-banners-list-data';
import { useBannersDetailData } from './use-banners-detail-data';
import { useBannersDetailId } from './use-banners-detail-id';

/* * */

interface BannersDetailFormContextValue extends StandardFormContextValue<UpdateOperationalBannerDto> {
	data: null | OperationalBanner
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
	const { id } = useBannersDetailId();
	const { data: me } = useMeData();
	const { data, error, isLoading, mutate } = useBannersDetailData();
	const { mutate: mutateList } = useBannersListData();
	const catalog = PermissionCatalog.all.banners;
	const canUpdate = PermissionCatalog.hasPermission(me?.permissions ?? [], catalog.scope, catalog.actions.update);

	//
	// B. Set up validation and unsaved-change protection

	const { form, isDirty, unblock } = useStandardForm<UpdateOperationalBannerDto, typeof UpdateOperationalBannerSchema>({
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
		schema: UpdateOperationalBannerSchema,
	});
	const values = useStandardFormWatch({ control: form.control });
	// Errors recorded before the first save attempt are not re-validated on change, so validate current values instead.
	const isValid = UpdateOperationalBannerSchema.safeParse(values).success;

	//
	// C. Save content or change publication state

	const { action: handleUpdate, isLoading: isUpdating } = useHandleAction({
		fetchFn: () =>
			fetchApiData<OperationalBanner>({
				body: UpdateOperationalBannerSchema.parse(form.getValues()),
				method: 'PUT',
				url: API_ROUTES.core.OPERATIONAL_BANNERS_DETAIL(id),
			}),
		onSuccess: (response) => {
			form.reset(response.data);
			mutate(response);
			mutateList();
		},
	});
	const { action: handlePublication, isLoading: isPublishing } = useHandleAction<OperationalBanner, 'archive' | 'publish' | 'unpublish'>({
		fetchFn: action =>
			fetchApiData<OperationalBanner>({
				body: { status: ({ archive: 'archived', publish: 'published', unpublish: 'draft' } as const)[action] },
				method: 'PUT',
				url: API_ROUTES.core.OPERATIONAL_BANNERS_DETAIL(id),
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
			if (action === 'publish' && !OperationalBannerSchema.safeParse({ ...data, published_at: data.published_at ?? Date.now(), published_by: me?._id, status: 'published' }).success) {
				useToast.warning({ message: t('default:dev.hints.incomplete') });
				return;
			}
			handlePublication(action);
		},
		[canUpdate, data, handlePublication, isBusy, isDirty, me?._id, t],
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

	return <BannersDetailFormContext.Provider value={value}>{children}</BannersDetailFormContext.Provider>;
}
