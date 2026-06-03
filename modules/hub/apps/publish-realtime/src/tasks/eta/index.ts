import { publishEtaGtfs } from '@/tasks/eta/publish-eta-gtfs.js';
import { publishEtaJson } from '@/tasks/eta/publish-eta-json.js';

/* * */

export const publishEta = async () => await Promise.all([publishEtaGtfs(), publishEtaJson()]);
