package execution

import (
	"errors"
	"slices"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	context "github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/context"
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables/logger"
)

// CollectErrors records and reports a technical error, then returns all
// collected errors in rule-ID order. The combined result is also stored in run.Err.
// Pass a rule context to mark it failed and attach its source location, or nil for general errors.
func CollectErrors(run *validationTypes.Execution, id string, ctx *types.ValidationContext, err error) error {
	//

	//
	// 1. Resolve the source location and mark the rule failed when a context is available

	file, field := "N/A", "N/A"
	if ctx != nil {
		ctx.Failed = true
		if ctx.FileName != "" {
			file = ctx.FileName
		}
		if ctx.Field != "" {
			field = ctx.Field
		}
	}

	var rows []int
	if source, ok := context.RowErrorDetails(err); ok {
		file = source.Table + ".txt"
		field = source.Field
		rows = []int{source.Row}
	}

	//
	// 2. Collect concurrent failures and update the combined result

	run.Mu.Lock()
	run.Failures[id] = err
	ids := make([]string, 0, len(run.Failures))
	for id := range run.Failures {
		ids = append(ids, id)
	}
	slices.Sort(ids)
	failures := make([]error, 0, len(ids))
	for _, id := range ids {
		failures = append(failures, run.Failures[id])
	}
	run.Err = errors.Join(failures...)
	collected := run.Err
	run.Mu.Unlock()

	//
	// 3. Keep technical failures visible regardless of user-configured rule severity

	run.Messages.AddMessage(messages.Message{
		RuleID: "file_validation", FileName: file, Field: field, Rows: rows,
		Message: err.Error(), Severity: rules.SEVERITY_ERROR, SeverityResolved: true,
	})
	logger.AppLogger.Error(telemetry.LogEntry{Message: err.Error(), Error: err, Attributes: map[string]any{"rule_id": id}})
	return collected
}
