package validations

import (
	"database/sql"
	"fmt"
	"slices"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	collector "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/algorithm"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/execution"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/registry"
	DAG "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/algorithm"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables/logger"
)

/*
* RunValidations orchestrates all rules through one global Kahn dependency DAG.
* A node finishes after its entire source table is checked. Failed or skipped
* prerequisites block dependents; every ready rule starts without a concurrency cap.
* Configuration is already validated. The supplied database must remain open during the run.
* Process-wide message overrides, when used by the CLI, must also remain stable.
* A nil collector creates a private report. Operational failures are reported and returned;
* ordinary GTFS errors and warnings are returned in Result.Summary.
 */
func RunValidations(db *sql.DB, configuration map[string]rules.RuleConfig, messageService messages.MessageService) (validationTypes.Result, error) {
	//

	//
	// 1. Create one execution state and validate the prepared inputs

	if messageService == nil {
		messageService = collector.NewMessageService()
	}

	state := &validationTypes.Execution{Messages: messageService, Failures: make(map[string]error)}
	result := validationTypes.Result{}
	
	finish := func(err error) (validationTypes.Result, error) {
		result.Summary = messageService.GetSummary()
		return result, err
	}
	
	if db == nil {
		return finish(execution.CollectErrors(state, "", "N/A", "N/A", nil, fmt.Errorf("database connection is nil")))
	}
	
	if err := db.Ping(); err != nil {
		return finish(execution.CollectErrors(state, "", "N/A", "N/A", nil, fmt.Errorf("open validation database: %w", err)))
	}

	//
	// 2. Collect callbacks registered in registry-rules.go

	RegisterRules()
	checks := registry.Checks()

	//
	// 3. Add tables file presence control gates and diagnostic-only identifiers

	TablesFilePresence(checks)

	// Runtime notices have no executable check. They stay skipped as prerequisites.
	for _, id := range []string{"file_validation", "file_not_found_in_rules"} {
		checks[id] = nil
	}
	for id, config := range configuration {
		if _, exists := checks[id]; !exists {
			if config.Severity != "" && config.Severity != rules.SEVERITY_IGNORE {
				return finish(execution.CollectErrors(state, id, "N/A", "N/A", nil, fmt.Errorf("rule %q has no execution callback", id)))
			}
			checks[id] = nil
		}
	}

	//
	// 4. Build the global DAG using only dependencies supplied in rules.json

	ids := make([]string, 0, len(checks))
	for id := range checks {
		ids = append(ids, id)
	}

	slices.Sort(ids)
	
	nodes := make([]DAG.Rule[*validationTypes.Execution], 0, len(ids))
	
	for _, id := range ids {
		check := checks[id]
		config := configuration[id]
		if config.Severity == "" {
			config.Severity = rules.SEVERITY_IGNORE
		}
		ruleContext := context.NewRuleContext(id, db, config.RuleContext, messageService)
		dependencies := slices.Clone(config.DependsOn)
		nodes = append(nodes, DAG.Rule[*validationTypes.Execution]{ID: ruleContext.RuleID, DependsOn: dependencies, Run: func(run *validationTypes.Execution) DAG.Status {
			return execution.RunRule(run, ruleContext, check)
		}})
	}
	
	manager, err := algorithm.NewManager(nodes...)
	if err != nil {
		return finish(execution.CollectErrors(state, "", "N/A", "N/A", nil, fmt.Errorf("prepare validation DAG: %w", err)))
	}

	//
	// 5. Run the global scheduler once, releasing dependents on each rule completion

	logger.AppLogger.Info(telemetry.LogEntry{Message: fmt.Sprintf("Global validation DAG ready: %d rules", len(nodes)), Attributes: map[string]any{"rules": len(nodes)}})
	result.Statuses, err = algorithm.RunRules(manager, state)
	if err != nil {
		execution.CollectErrors(state, "", "N/A", "N/A", nil, err)
	}

	//
	// 6. Return only after every started worker has finished and reporting is complete

	return finish(state.Err)
}
