// Package execution runs rule callbacks and collects operational failures.
package execution

import (
	"fmt"
	"strings"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	context "github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/context"
	DAG "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/algorithm"
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/context"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables/logger"
)

// ExecuteValidation calls the validation function and returns its context outcome.
func ExecuteValidation(run *validationTypes.Execution, ctx *types.ValidationContext, validate validationTypes.Check) (status DAG.Status) {
	//

	//
	// 1. Turn unexpected callback panics into reported operational failures

	id := ctx.RuleID
	status = DAG.Failed
	defer func() {
		if recovered := recover(); recovered != nil {
			CollectErrors(run, id, ctx, fmt.Errorf("rule %q panicked: %v", id, recovered))
			status = DAG.Failed
		}
	}()

	//
	// 2. Skip disabled validations, preserving file-presence control behavior

	if validate == nil {
		ctx.Skipped = true
		return DAG.Skipped
	}

	if context.ShouldIgnore(ctx) && !strings.HasSuffix(id, "_file_missing") {
		ctx.Skipped = true
		return DAG.Skipped
	}

	//
	// 3. Track timing and progress

	timing := telemetry.NewTimer()
	logger.AppLogger.Progress(telemetry.LogEntry{
		Message:    "Running " + id,
		Attributes: map[string]any{"rule_id": id},
	})

	defer func() {
		logRuleCompletion(id, status, timing)
	}()

	//
	// 4. Execute the validation and report any operational error

	if err := validate(ctx); err != nil {
		CollectErrors(run, id, ctx, fmt.Errorf("rule %q: %w", id, err))
		return DAG.Failed
	}

	//
	// 5. Return the outcome recorded by the validation

	status = context.Status(ctx)
	return status
}
