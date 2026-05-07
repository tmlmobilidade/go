'use client';

import { useRideAcceptanceContext } from '@/contexts/RideAcceptance.context';
import { PAYMENT_REQUEST_TRANSLATIONS } from '@/lib/translations';
import { IconEdit } from '@tabler/icons-react';
import { PermissionCatalog, RIDE_PAYMENT_REQUIRED_OPTIONS, type RideAcceptance } from '@tmlmobilidade/types';
import { Divider, HasPermission, IconButton, Label, Section, Select, Tag, Text } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAcceptancePaymentRequest() {
	const { actions, data } = useRideAcceptanceContext();
	const { t } = useTranslation();

	const [isEditing, setIsEditing] = useState(false);

	const acceptance = data.acceptance;
	if (!acceptance) return null;

	const paymentRequired = acceptance.payment_required;
	const displayPaymentRequired = paymentRequired ?? 'no';
	const showSelect = isEditing;

	const handlePaymentChange = async (value: null | string) => {
		const next
			= value === '' || value == null
				? null
				: (value as NonNullable<RideAcceptance['payment_required']>);
		await actions.changePaymentRequest(next);
		setIsEditing(false);
	};

	return (
		<Section gap="xs" padding="none">
			<Label size="md" caps>{t('default:rides.acceptance.RideAcceptancePaymentRequest.title')}</Label>
			{showSelect ? (
				<HasPermission
					action={PermissionCatalog.all.rides.actions.acceptance_payment_request}
					scope={PermissionCatalog.all.rides.scope}
					fallback={(
						<Text c="dimmed" size="sm">
							{PAYMENT_REQUEST_TRANSLATIONS[displayPaymentRequired]}
						</Text>
					)}
				>
					<Select
						onChange={value => void handlePaymentChange(value)}
						value={displayPaymentRequired}
						w="100%"
						data={RIDE_PAYMENT_REQUIRED_OPTIONS.map(option => ({
							label: PAYMENT_REQUEST_TRANSLATIONS[option],
							value: option,
						}))}
						clearable
					/>
				</HasPermission>
			) : (
				<Section alignItems="center" flexDirection="row" gap="xs" padding="none">
					<Tag label={PAYMENT_REQUEST_TRANSLATIONS[displayPaymentRequired]} variant="secondary" />
					<HasPermission
						action={PermissionCatalog.all.rides.actions.acceptance_payment_request}
						scope={PermissionCatalog.all.rides.scope}
					>
						<IconButton
							aria-label="Editar estado de pagamento"
							icon={<IconEdit />}
							onClick={() => setIsEditing(true)}
							variant="subtle"
						/>
					</HasPermission>
				</Section>
			)}
		</Section>
	);
}
