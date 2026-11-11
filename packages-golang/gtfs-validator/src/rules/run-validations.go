package rules

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/services"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

// RunValidations runs the built-in rules against an imported database.
// The caller owns the database and is responsible for closing it afterward.
func RunValidations(ctx context.Context, db *sql.DB, concurrency int) ([]types.Result[[]Finding], error) {
	rules := registry()
	tasks := make([]types.Task[[]Finding], 0, len(rules))

	for _, r := range rules {
		tasks = append(tasks, types.Task[[]Finding]{
			ID:           r.id,
			Dependencies: r.dependencies,
			// This closure remembers the current rule and database for execution later.
			Run: func(ctx context.Context) (types.Outcome[[]Finding], error) {
				findings, err := r.validate(ctx, db)

				outcome := types.Outcome[[]Finding]{Value: findings}

				// Error and forbidden findings block dependents; other severities allow them.
				for _, finding := range findings {
					switch finding.Severity {
					case SEVERITY_ERROR, SEVERITY_FORBIDDEN:
						outcome.Failed = true
					case SEVERITY_IGNORE, SEVERITY_INFO, SEVERITY_WARNING:
					default:
						return outcome, fmt.Errorf("invalid finding severity %q", finding.Severity)
					}
				}

				return outcome, err
			},
		})
	}

	graph, err := services.NewDAG(tasks)
	if err != nil {
		return nil, err
	}
	return graph.Execute(ctx, concurrency)
}
