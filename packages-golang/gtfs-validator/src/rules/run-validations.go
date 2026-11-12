package rules

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"slices"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/services"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

// ErrInvalidConfiguration identifies rule input errors before execution.
var ErrInvalidConfiguration = errors.New("invalid rule configuration")

// NewValidationGraph resolves the configured rules and validates their dependencies
// before the feed is imported. The database is supplied when the graph runs.
func NewValidationGraph(configs []types.Rule) (*services.DAG[*sql.DB, []Finding], error) {
	if len(configs) == 0 {
		return nil, fmt.Errorf("%w: provide at least one rule", ErrInvalidConfiguration)
	}

	tasks := make([]types.Task[*sql.DB, []Finding], 0, len(configs))
	for _, config := range configs {
		config.RuleID = strings.ToLower(config.RuleID)
		validate, exists := registry[config.RuleID]
		if !exists {
			return nil, fmt.Errorf("%w: unknown executable rule %q", ErrInvalidConfiguration, config.RuleID)
		}

		config.Severity = types.Severities(strings.ToLower(string(config.Severity)))
		switch config.Severity {
		case SEVERITY_IGNORE, SEVERITY_INFO, SEVERITY_WARNING, SEVERITY_ERROR, SEVERITY_FORBIDDEN:
		default:
			return nil, fmt.Errorf("%w: rule %q has invalid severity %q", ErrInvalidConfiguration, config.RuleID, config.Severity)
		}

		config.DependsOn = slices.Clone(config.DependsOn)
		for i, dependency := range config.DependsOn {
			config.DependsOn[i] = strings.ToLower(dependency)
		}
		config.Options = slices.Clone(config.Options)
		config.Compare = slices.Clone(config.Compare)

		task := types.Task[*sql.DB, []Finding]{
			ID:           config.RuleID,
			Dependencies: config.DependsOn,
			Run: func(ctx context.Context, db *sql.DB) (types.Outcome[[]Finding], error) {
				return runCheck(ctx, db, config, validate)
			},
		}
		if config.Severity == SEVERITY_IGNORE && !strings.HasSuffix(config.RuleID, "_file_missing") {
			task.SkipReason = "rule ignored"
		}
		tasks = append(tasks, task)
	}

	graph, err := services.NewDAG(tasks)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrInvalidConfiguration, err)
	}
	return graph, nil
}

func runCheck(ctx context.Context, db *sql.DB, config types.Rule, validate check) (types.Outcome[[]Finding], error) {
	passed, findings, err := validate(ctx, db, config)
	for i := range findings {
		findings[i].Severity = config.Severity
	}

	// Even an informational finding blocks dependents. A check can also fail
	// silently, such as an ignored file-presence rule with a missing table.
	return types.Outcome[[]Finding]{
		Value:  findings,
		Failed: !passed || len(findings) > 0,
	}, err
}
