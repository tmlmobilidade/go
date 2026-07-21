import { type Observability } from '@/utils/observability.js';
import { type OCIStorageClientWrapper } from '@tmlmobilidade/go-clients-oci-storage';

export interface StorageDeps {
	blobs: OCIStorageClientWrapper
	observability: Observability
}
