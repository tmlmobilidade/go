import { createSentryClientInstrumentation } from '@tmlmobilidade/logger-logger-frontend';

export const { onRouterTransitionStart } = createSentryClientInstrumentation('frontend-navegante-app', 'hub');
