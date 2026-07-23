import { createSentryInstrumentation } from '@tmlmobilidade/logger-logger-frontend';

export const { onRequestError, register } = createSentryInstrumentation('frontend-navegante-app', 'hub');
