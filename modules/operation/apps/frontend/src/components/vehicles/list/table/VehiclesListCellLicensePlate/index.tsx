/* * */

import { formatLicensePlate } from '@/utils/formatLicencePlate';
import { Tag } from '@tmlmobilidade/ui';

/* * */

export function VehiclesListCellLicensePlate({ value }: { value: string }) {
	return <Tag label={formatLicensePlate(value)} />;
}
