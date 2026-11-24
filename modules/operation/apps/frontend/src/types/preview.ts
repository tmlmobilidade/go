import { type CreateVehicleDto } from '@tmlmobilidade/go-types-operation';

export interface VehicleImportPreview {
	mode: 'CREATE' | 'DUPLICATE' | 'EXISTS'
	vehicle: CreateVehicleDto
}
