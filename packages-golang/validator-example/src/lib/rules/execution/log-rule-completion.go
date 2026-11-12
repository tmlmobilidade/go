package execution

import (
	"fmt"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	DAG "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/algorithm"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables/logger"
)

// logRuleCompletion reports the final status and elapsed time of an executed rule.
func logRuleCompletion(id string, status DAG.Status, timing *telemetry.Timer) {
	//

	//
	// 1. Map the status to a human-readable name

	name := map[DAG.Status]string{
		DAG.Passed:  "passed",
		DAG.Failed:  "failed",
		DAG.Skipped: "skipped",
	}[status]

	//
	// 2. Log the completion

	logger.AppLogger.Info(telemetry.LogEntry{
		Message: fmt.Sprintf("Completed %s: %s (%s)", id, name, timing.Get()),
		Attributes: map[string]any{
			"rule_id":     id,
			"status":      name,
			"duration_ms": timing.GetMs(),
		},
	})
}
