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

// ErrInvalidConfiguration is a sentinel error for bad rule input.
// Callers can check errors.Is(err, ErrInvalidConfiguration) to distinguish
// setup problems from failures that happen while a rule is running.
var ErrInvalidConfiguration = errors.New("invalid rule configuration")

// NewValidationGraph turns a list of rule configs into a DAG (directed acyclic
// graph) of validation tasks.
//
// The graph is built before the GTFS feed is imported into the database. At
// this stage we only resolve rule IDs, check severities, and verify that
// DependsOn references form a valid dependency tree (no unknown dependencies, no
// cycles). The *sql.DB is not opened here; it is passed in later when the
// graph is executed.
//
// The two type parameters on DAG mean:
//   - *sql.DB is the shared input every rule receives (the feed database)
//   - []Finding is what each rule returns (zero or more validation messages)
func NewValidationGraph(configs []types.Rule) (*services.DAG[*sql.DB, []Finding], error) {
	if len(configs) == 0 {
		return nil, fmt.Errorf("%w: provide at least one rule", ErrInvalidConfiguration)
	}

	// Pre-size the slice so append does not reallocate as we grow.
	tasks := make([]types.Task[*sql.DB, []Finding], 0, len(configs))
	for _, config := range configs {
		// Rule IDs are case-insensitive in config and graph dependencies.
		config.RuleID = strings.ToLower(config.RuleID)
		validate, err := findCheck(config.RuleID)
		if err != nil {
			return nil, err
		}

		config.Severity = types.Severities(strings.ToLower(string(config.Severity)))
		// Empty case bodies: Go's switch with no body means "these values are OK".
		// Anything else falls through to default and is rejected.
		switch config.Severity {
		case SEVERITY_IGNORE, SEVERITY_INFO, SEVERITY_WARNING, SEVERITY_ERROR, SEVERITY_FORBIDDEN:
		default:
			return nil, fmt.Errorf("%w: rule %q has invalid severity %q", ErrInvalidConfiguration, config.RuleID, config.Severity)
		}

		// Clone slices so later mutation of this config cannot affect the caller's
		// original Rule (and so we can safely lowercase DependsOn in place).
		config.DependsOn = slices.Clone(config.DependsOn)
		for i, dependency := range config.DependsOn {
			config.DependsOn[i] = strings.ToLower(dependency)
		}
		config.Options = slices.Clone(config.Options)
		config.Compare = slices.Clone(config.Compare)

		// Each Task wraps one rule: ID for the graph node, Dependencies for ordering,
		// and Run as a closure that captures this rule's config + validate function.
		task := types.Task[*sql.DB, []Finding]{
			ID:           config.RuleID,
			Dependencies: config.DependsOn,
			Run: func(ctx context.Context, db *sql.DB) (types.Outcome[[]Finding], error) {
				return runCheck(ctx, db, config, validate)
			},
		}
		// Ignored file-presence checks still enforce prerequisites. Missing
		// implementations still run so their warning is included in the report.
		if validate != nil && config.Severity == SEVERITY_IGNORE && !strings.HasSuffix(config.RuleID, "_file_missing") {
			task.SkipReason = "rule ignored"
		}
		tasks = append(tasks, task)
	}

	// NewDAG also rejects unknown dependencies and cycles; wrap those as config errors.
	graph, err := services.NewDAG(tasks)
	if err != nil {
		return nil, fmt.Errorf("%w: %w", ErrInvalidConfiguration, err)
	}
	return graph, nil
}

// runCheck executes one validation method and adapts its result for the DAG.
//
// Outcome.Failed is true when the check did not pass OR returned any findings.
// That includes info/warning findings: dependents still wait for a clean result.
// A check can also "fail" with no findings (e.g. an ignored file-presence rule
// whose table is missing) — Failed then blocks dependents without a message.
func runCheck(ctx context.Context, db *sql.DB, config types.Rule, validate check) (types.Outcome[[]Finding], error) {
	if validate == nil {
		return types.Outcome[[]Finding]{
			Failed: true,
			Value: []Finding{{
				Description: "The configured rule has no implementation.",
				Severity:    SEVERITY_WARNING,
				Field:       "system",
				Message:     fmt.Sprintf("Rule %q has no implementation and could not be executed.", config.RuleID),
			}},
		}, nil
	}
	passed, findings, err := validate(ctx, db, config)
	for i := range findings {
		findings[i].Severity = config.Severity
	}

	return types.Outcome[[]Finding]{
		Value:  findings,
		Failed: !passed || len(findings) > 0,
	}, err
}
