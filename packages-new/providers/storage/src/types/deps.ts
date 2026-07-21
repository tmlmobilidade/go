import { type OciBlobStore } from '@/oci-blob-store.js';
import { type Observability } from '@/utils/observability.js';

export interface StorageDeps {
	blobs: OciBlobStore
	observability: Observability
}
