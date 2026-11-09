package rules

import (
	"context"
	"database/sql"
	"fmt"
	"sort"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/dag"
)

// RunValidations runs the built-in rules against an imported database.
// The caller owns the database and is responsible for closing it afterward.
func RunValidations(ctx context.Context, db *sql.DB, concurrency int) (Report, error) {
	return executeRules(ctx, db, registry(), concurrency)
}

func executeRules(ctx context.Context, db *sql.DB, rules []rule, concurrency int) (Report, error) {
	report := Report{Rules: []RuleResult{}}

	// []Finding means a slice (a growable list) of findings. The generic DAG
	// carries this value without needing to know anything about GTFS or SQLite.
	tasks := make([]dag.Task[[]Finding], 0, len(rules))

	for _, r := range rules {
		tasks = append(tasks, dag.Task[[]Finding]{
			ID:           r.id,
			Dependencies: r.dependencies,
			// This closure remembers the current rule and database for execution later.
			Run: func(ctx context.Context) (dag.Outcome[[]Finding], error) {
				findings, err := r.validate(ctx, db)

				outcome := dag.Outcome[[]Finding]{Value: findings}

				// Only error findings block dependents. Warnings remain in the report.
				for _, finding := range findings {
					switch finding.Severity {
					case Error:
						outcome.Failed = true
					case Warning:
					default:
						return outcome, fmt.Errorf("invalid finding severity %q", finding.Severity)
					}
				}

				return outcome, err
			},
		})
	}

	// Reject malformed dependencies before executing any check.
	graph, err := dag.New(tasks)
	if err != nil {
		report.Error = err.Error()
		return report, err
	}

	results, err := graph.Execute(ctx, concurrency)

	// Translate generic task outputs into the validator's public JSON report.
	for _, result := range results {
		findings := result.Value

		// A nil slice encodes as null. Use an empty slice for consistent JSON [].
		if findings == nil {
			findings = []Finding{}
		}

		report.Rules = append(report.Rules, RuleResult{
			ID:        result.ID,
			Status:    result.Status,
			Findings:  findings,
			BlockedBy: result.BlockedBy,
			Reason:    result.Reason,
			Error:     result.Error,
		})

		for _, finding := range findings {
			if finding.Severity == Error {
				report.TotalErrors++
			}
			if finding.Severity == Warning {
				report.TotalWarnings++
			}
		}
	}

	if err != nil {
		report.Error = err.Error()
	}

	return report, err
}

// PendingReport lists every built-in rule before validation starts. The main
// package uses it to return a complete report even if importing the feed fails.
func PendingReport() Report {
	// Start with every rule marked as skipped, so even an import failure produces
	// a complete list. Empty slices ([]RuleResult{}) encode as JSON [] rather than null.
	report := Report{Rules: []RuleResult{}}
	for _, rule := range registry() {
		report.Rules = append(report.Rules, RuleResult{
			ID:       rule.id,
			Status:   dag.Skipped,
			Findings: []Finding{},
			Reason:   "validation did not start",
		})
	}
	sort.Slice(report.Rules, func(i, j int) bool { return report.Rules[i].ID < report.Rules[j].ID })

	return report
}
