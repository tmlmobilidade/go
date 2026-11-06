package execution

import (
	"errors"
	"slices"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables/logger"
)

// CollectErrors records and reports a technical error, then returns all
// collected errors in rule-ID order. The combined result is also stored in run.Err.
func CollectErrors(run *validationTypes.Execution, id, file, field string, rows []int, err error) error {
	//

	//
	// 1. Collect concurrent failures and update the combined result

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
	// 2. Keep technical failures visible regardless of user-configured rule severity

	run.Messages.AddMessage(messages.Message{
		RuleID: "file_validation", FileName: file, Field: field, Rows: rows,
		Message: err.Error(), Severity: rules.SEVERITY_ERROR, SeverityResolved: true,
	})
	logger.AppLogger.Error(telemetry.LogEntry{Message: err.Error(), Error: err, Attributes: map[string]any{"rule_id": id}})
	return collected
}
