// go/commitlint.config.cjs
// GO monorepo commit conventions.
// Inherits TML base rules (types, subject format) from @commitlint/config-conventional
// and adds GO-specific module scopes as warnings.
// Docs: https://github.com/tmlmobilidade/tml-skills/blob/main/commits/README.md

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // ─── Types ───────────────────────────────────────────────────────
    // Must match the shared list in tml-skills/commits/commitlint.config.cjs.
    'type-enum': [
      2, // error — blocks commit
      'always',
      [
        'feat',     // new feature
        'fix',      // bug fix
        'refactor', // code change, no new feature or bug fix
        'perf',     // performance improvement
        'test',     // adding or updating tests
        'docs',     // documentation only (includes skill updates)
        'chore',    // maintenance, dependency bumps, config changes
        'ci',       // CI/CD pipeline changes
        'style',    // formatting only, no logic change
        'revert',   // reverts a previous commit
        'wip',      // work in progress — draft PRs only, never merge to main
      ],
    ],

    // ─── Scopes ──────────────────────────────────────────────────────
    // Severity 1 = warning (won't block commit — just a reminder).
    // Add new module names here as the monorepo grows.
    'scope-enum': [
      1, // warning
      'always',
      [
        // GO domain modules (modules/)
        'alerts',
        'apex',
        'auth',
        'controller',
        'dates',
        'eta',
        'exporter',
        'fleet',
        'hub',
        'locations',
        'offer',
        'performance',
        'plans',
        'replicator',
        'stops',
        'tracker',

        // Shared packages (packages/)
        'ui',         // @tmlmobilidade/ui — component library
        'types',      // @tmlmobilidade/types — all types, DTOs, Zod schemas
        'interfaces', // @tmlmobilidade/interfaces — MongoDB collection methods
        'consts',     // @tmlmobilidade/consts — API routes, page routes, HTTP codes
        'utils',      // @tmlmobilidade/utils — shared utilities
        'fastify',    // @tmlmobilidade/fastify — Fastify server + auth middleware
        'mongo',      // @tmlmobilidade/mongo — MongoDB client
        'rabbitmq',   // @tmlmobilidade/rabbitmq — message queue client

        // Cross-cutting
        'infra',    // Kubernetes, deployment, infrastructure config
        'scripts',  // monorepo-level scripts (generate-routes, repo-rinse, etc.)
        'cli',      // CLI tools (env-sync, backupd, etc.)
        'deps',     // dependency updates
        'config',   // project configuration
        'ci',       // CI/CD pipeline
        'docs',     // documentation and skills
        'skills',  // new go skills or updates to existing ones
      ],
    ],

    // ─── Subject line ────────────────────────────────────────────────
    'subject-max-length': [2, 'always', 72],
    'subject-min-length': [2, 'always', 10],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    // ─── Type and scope formatting ───────────────────────────────────
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],

    // ─── Body ────────────────────────────────────────────────────────
    'body-max-line-length': [1, 'always', 100],
    'body-leading-blank': [2, 'always'],

    // ─── Footer ──────────────────────────────────────────────────────
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [1, 'always', 100],
  },

  helpUrl: 'https://github.com/tmlmobilidade/tml-skills/blob/main/commits/README.md',
};
