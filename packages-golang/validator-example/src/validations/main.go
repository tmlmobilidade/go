package validations

import (
	"database/sql"
	"fmt"
	"slices"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	context "github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/context"
	collector "github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/rules/algorithm"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/rules/execution"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/rules/registry"
	DAG "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/algorithm"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables/logger"
)

/*
* RunValidations orchestrates configured rules and their prerequisites through one global Kahn dependency DAG.
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
		return finish(execution.CollectErrors(state, "", nil, fmt.Errorf("database connection is nil")))
	}
	if err := db.Ping(); err != nil {
		return finish(execution.CollectErrors(state, "", nil, fmt.Errorf("open validation database: %w", err)))
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
				return finish(execution.CollectErrors(state, id, nil, fmt.Errorf("rule %q has no execution callback", id)))
			}
			checks[id] = nil
		}
	}

	//
	// 4. Select configured rules and their declared prerequisites for the DAG

	// Omitted rules are only needed when a configured rule depends on them.
	// This keeps unrelated file-presence checks out of the execution graph.
	required := make(map[string]bool, len(configuration))
	for id, config := range configuration {
		required[id] = true
		for _, dependency := range config.DependsOn {
			required[dependency] = true
		}
	}

	ids := make([]string, 0, len(checks))
	for id := range checks {
		if required[id] {
			ids = append(ids, id)
		}
	}

	//
	// 5. Create the DAG nodes

	ruleNodes := make([]DAG.Rule[*validationTypes.Execution], 0, len(ids))

	for _, id := range ids {
		check := checks[id]
		config := configuration[id]
		if config.Severity == "" {
			config.Severity = rules.SEVERITY_IGNORE
		}
		ruleContext := context.NewRuleContext(id, db, config.RuleContext, messageService)
		dependencies := slices.Clone(config.DependsOn)
		ruleNodes = append(ruleNodes, DAG.Rule[*validationTypes.Execution]{ID: ruleContext.RuleID, DependsOn: dependencies, Run: func(run *validationTypes.Execution) DAG.Status {
			return execution.RunRule(run, ruleContext, check)
		}})
	}

	manager, err := algorithm.NewManager(ruleNodes...)
	if err != nil {
		return finish(execution.CollectErrors(state, "", nil, fmt.Errorf("prepare validation DAG: %w", err)))
	}

	//
	// 5. Run the global scheduler once, releasing dependents on each rule completion

	logger.AppLogger.Info(telemetry.LogEntry{Message: fmt.Sprintf("Global validation DAG ready: %d rules", len(ruleNodes)), Attributes: map[string]any{"rules": len(ruleNodes)}})
	result.Statuses, err = algorithm.RunRules(manager, state)
	if err != nil {
		execution.CollectErrors(state, "", nil, err)
	}

	//
	// 6. Return only after every started worker has finished and reporting is complete

	return finish(state.Err)
}
