'use client';

import { API_ROUTES, PAGE_ROUTES } from '@tmlmobilidade/consts';
import { type ChangelogRelease, type CreateChangelogReleaseDto, CreateChangelogReleaseSchema } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { fetchApiData, keepUrlParams, type StandardFormContextValue, useHandleAction, useMeData, useStandardForm, useStandardFormCapabilities } from '@tmlmobilidade/ui';
import { useRouter } from 'next/navigation';
import { createContext, type PropsWithChildren, useContext, useMemo } from 'react';

import { useChangelogListData } from '../list/use-changelog-list-data';
import { closeChangelogCreateModal } from './ChangelogCreate.modal';

/* * */

const ChangelogCreateFormContext = createContext<StandardFormContextValue<CreateChangelogReleaseDto> | undefined>(undefined);

/* * */

export function useChangelogCreateFormContext() {
	//

	const value = useContext(ChangelogCreateFormContext);
	if (!value) throw new Error('useChangelogCreateFormContext must be used within its provider');

	return value;
}

/* * */

export function ChangelogCreateFormContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data: me } = useMeData();
	const { mutate } = useChangelogListData();
	const catalog = PermissionCatalog.all.changelogs;
	const canCreate = PermissionCatalog.hasPermission(me?.permissions ?? [], catalog.scope, catalog.actions.update);

	//
	// B. Set up the draft form

	const { form, isDirty, isValid, unblock } = useStandardForm<CreateChangelogReleaseDto, typeof CreateChangelogReleaseSchema>({
		defaultValues: { items: [], scope: { type: 'platform' }, summary: '', title: '' },
		schema: CreateChangelogReleaseSchema,
	});

	//
	// C. Create and open the new draft

	const { action: handleCreate, isLoading: isCreating } = useHandleAction({
		fetchFn: () =>
			fetchApiData<ChangelogRelease>({
				body: CreateChangelogReleaseSchema.parse(form.getValues()),
				method: 'POST',
				url: API_ROUTES.core.CHANGELOG_RELEASES_LIST,
			}),
		onSuccess: (response) => {
			if (!response.data) return;
			form.reset();
			unblock();
			closeChangelogCreateModal();
			mutate();
			router.push(keepUrlParams(PAGE_ROUTES.core.DEV_CHANGELOG_DETAIL(response.data._id)));
		},
	});
	const capabilities = useStandardFormCapabilities({ create: { hasPermission: canCreate, isCreating: isCreating }, form: { isDirty, isValid } });

	//
	// D. Expose form state

	const value = useMemo(
		() => ({
			actions: { create: () => form.handleSubmit(() => handleCreate())() },
			capabilities,
			form,
			isDirty,
			isValid,
			status: { isCreating: isCreating },
			unblock,
		}),
		[capabilities, handleCreate, isCreating, form, isDirty, isValid, unblock],
	);

	return <ChangelogCreateFormContext.Provider value={value}>{children}</ChangelogCreateFormContext.Provider>;
}
