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

/*
* CollectErrors records an operational failure, such as a query error or recovered
* panic, and reports it as a technical error regardless of configured severity.
* Ordinary GTFS findings are reported through the rule context instead.
* A non-nil ctx is marked failed and supplies the source location. Pass nil for
* setup errors without a rule context; wrapped RowError details take precedence.
* The latest error for each ruleID is retained, including the empty ID used by setup.
* Errors are joined in rule-ID order, stored in run.Err, and returned as a snapshot
* that may not include failures from workers that finish later.
*
* err must be non-nil, and run must have an initialized Failures map and Messages service.
 */
func CollectErrors(run *validationTypes.Execution, ruleID string, ctx *types.ValidationContext, err error) error {
	//

	//
	// 1. Mark the rule failed and use its location when available

	fileName, fieldName := "N/A", "N/A"
	var rows []int

	if ctx != nil {
		ctx.Failed = true

		if ctx.FileName != "" {
			fileName = ctx.FileName
		}
		if ctx.Field != "" {
			fieldName = ctx.Field
		}
	}

	//
	// 2. Prefer the failing row's location, even through wrapped errors
	// Rows remain zero-based here; the message service converts them to CSV line numbers.

	if source, ok := context.RowErrorDetails(err); ok {
		fileName = source.Table + ".txt"
		fieldName = source.Field
		rows = []int{source.Row}
	}

	//
	// 3. Store this failure and rebuild the combined error under the execution lock
	// Sorting rule IDs keeps the joined error stable regardless of worker completion order.

	run.Mu.Lock()
	run.Failures[ruleID] = err

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
	collectedErrors := run.Err
	run.Mu.Unlock()

	//
	// 4. Add a file_validation diagnostic after releasing the execution lock
	// SeverityResolved prevents configuration from hiding or downgrading this technical error.

	run.Messages.AddMessage(messages.Message{
		RuleID:           "file_validation",
		FileName:         fileName,
		Field:            fieldName,
		Rows:             rows,
		Message:          err.Error(),
		Severity:         rules.SEVERITY_ERROR,
		SeverityResolved: true,
	})

	//
	// 5. Log the originating rule ID and return the combined error snapshot

	logger.AppLogger.Error(telemetry.LogEntry{
		Message:    err.Error(),
		Error:      err,
		Attributes: map[string]any{"rule_id": ruleID},
	})
	
	//
	// 6. Return the combined error snapshot

	return collectedErrors
}
