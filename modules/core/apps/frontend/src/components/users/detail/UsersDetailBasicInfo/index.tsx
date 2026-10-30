'use client';

import { IconMail, IconPhone } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Button, Collapsible, fetchApiData, Grid, Section, StandardFormController, TextInput, useHandleAction } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useUsersDetailData } from '../use-users-detail-data';
import { useUsersDetailFormContext } from '../UsersDetailForm.context';

/* * */

export function UsersDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useUsersDetailFormContext();

	//
	// B. Handle actions

	const { data: userData } = useUsersDetailData();
	const { action: handleSendPasswordResetEmail, isLoading: isSendingPasswordResetEmail } = useHandleAction({
		fetchFn: async () => await fetchApiData<undefined>({
			body: { email: userData?.email },
			method: 'POST',
			url: API_ROUTES.core.AUTH_SEND_PASSWORD_RESET_EMAIL,
		}),
		labels: {
			success_message: t('unauthenticated:SendPasswordResetEmailForm.success.description'),
			success_title: t('unauthenticated:SendPasswordResetEmailForm.success.title'),
		},
		onSuccess: () => undefined,
	});

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:users.detail.BasicInfo.description')}
			title={t('default:users.detail.BasicInfo.title')}
		>
			<Section gap="md">
				<Grid columns="ab" gap="xl">

					<StandardFormController
						control={form.control}
						name="first_name"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:users.detail.BasicInfo.fields.first_name.label')}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('default:users.detail.BasicInfo.fields.first_name.placeholder')}
								value={field.value ?? ''}
								data-autofocus
								withAsterisk
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name="last_name"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:users.detail.BasicInfo.fields.last_name.label')}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('default:users.detail.BasicInfo.fields.last_name.placeholder')}
								value={field.value ?? ''}
								withAsterisk
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name="email"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:users.detail.BasicInfo.fields.email.label')}
								leftSection={<IconMail size={22} />}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('default:users.detail.BasicInfo.fields.email.placeholder')}
								type="email"
								value={field.value ?? ''}
								withAsterisk
							/>
						)}
					/>

					<StandardFormController
						control={form.control}
						name="phone"
						render={({ field, fieldState }) => (
							<TextInput
								disabled={!capabilities.editEnabled}
								error={fieldState.error?.message}
								label={t('default:users.detail.BasicInfo.fields.phone.label')}
								leftSection={<IconPhone size={22} />}
								maxLength={255}
								onBlur={field.onBlur}
								onChange={e => field.onChange(e.currentTarget.value)}
								placeholder={t('default:users.detail.BasicInfo.fields.phone.placeholder')}
								type="phone"
								value={field.value ?? ''}
								withAsterisk
							/>
						)}
					/>

					<Button
						disabled={!capabilities.editEnabled || !userData?.email || isSendingPasswordResetEmail}
						label={t('unauthenticated:SendPasswordResetEmailForm.submit.label')}
						loading={isSendingPasswordResetEmail}
						onClick={() => handleSendPasswordResetEmail()}
						type="button"
					/>

				</Grid>
			</Section>
		</Collapsible>
	);
}
