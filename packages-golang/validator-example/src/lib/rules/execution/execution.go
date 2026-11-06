// Package execution runs rule callbacks and collects operational failures.
package execution

import (
	"fmt"
	"strings"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	graph "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/algorithm"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables/logger"
)

// RunRule executes a callback released by Kahn; each rule owns its data access.
func RunRule(run *validationTypes.Execution, ctx *context.ValidationContext, check validationTypes.Check) (status graph.Status) {
	//

	//
	// 1. Turn unexpected callback panics into reported operational failures

	id := ctx.RuleID
	status = graph.Failed
	defer func() {
		if recovered := recover(); recovered != nil {
			ctx.Failed = true
			CollectErrors(run, id, "N/A", "N/A", nil, fmt.Errorf("rule %q panicked: %v", id, recovered))
			status = graph.Failed
		}
	}()

	//
	// 2. Skip disabled checks, preserving file-presence control behavior

	if check == nil {
		ctx.Skipped = true
		return graph.Skipped
	}
	if context.ShouldIgnore(ctx) && !strings.HasSuffix(id, "_file_missing") {
		ctx.Skipped = true
		return graph.Skipped
	}

	//
	// 3. Execute the registered whole-rule callback without choosing its table or fields

	before := run.Messages.RuleIssueCount(id)
	timing := telemetry.NewTimer()
	logger.AppLogger.Progress(telemetry.LogEntry{Message: "Running " + id, Attributes: map[string]any{"rule_id": id}})
	defer func() {
		name := map[graph.Status]string{graph.Passed: "passed", graph.Failed: "failed", graph.Skipped: "skipped"}[status]
		logger.AppLogger.Info(telemetry.LogEntry{Message: fmt.Sprintf("Completed %s: %s (%s)", id, name, timing.Get()), Attributes: map[string]any{"rule_id": id, "status": name, "duration_ms": timing.GetMs()}})
	}()
	err := check(ctx)
	if err != nil {
		ctx.Failed = true
		file, field := ctx.FileName, ctx.Field
		if file == "" {
			file = "N/A"
		}
		if field == "" {
			field = "N/A"
		}
		var rows []int
		if source, ok := context.RowErrorDetails(err); ok {
			file = source.Table + ".txt"
			field = source.Field
			rows = []int{source.Row}
		}
		CollectErrors(run, id, file, field, rows, fmt.Errorf("rule %q: %w", id, err))
		return graph.Failed
	}

	//
	// 4. Publish the completed rule outcome before dependents become ready

	status = context.Status(ctx)
	if status == graph.Passed && run.Messages.RuleIssueCount(id) > before {
		ctx.Failed = true
		return graph.Failed
	}
	return status
}
