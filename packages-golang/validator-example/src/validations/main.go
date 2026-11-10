package validations

import (
	"database/sql"
	"fmt"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	collector "github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/rules/algorithm"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/rules/execution"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/rules/registry"
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
	// 1. Create the message service

	if messageService == nil {
		messageService = collector.NewMessageService()
	}

	//
	// 2. Create the execution state

	state := &validationTypes.Execution{Messages: messageService, Failures: make(map[string]error)}
	result := validationTypes.Result{}

	finish := func(err error) (validationTypes.Result, error) {
		result.Summary = messageService.GetSummary()
		return result, err
	}

	//
	// 3. Validate the database is ready

	if db == nil {
		return finish(execution.CollectErrors(state, "", nil, fmt.Errorf("database connection is nil")))
	}

	if err := db.Ping(); err != nil {
		return finish(execution.CollectErrors(state, "", nil, fmt.Errorf("open validation database: %w", err)))
	}

	//
	// 4. Collect callbacks registered in registry-rules.go

	RegisterRules()
	checks := registry.Checks()

	//
	// 5. Add tables file presence control gates

	TablesFilePresence(checks)

	//
	// 6. Create the manager from the registered validations and configuration

	manager, err := algorithm.NewManager(db, configuration, checks, messageService)
	if err != nil {
		return finish(execution.CollectErrors(state, "", nil, fmt.Errorf("prepare validation DAG: %w", err)))
	}

	//
	// 7. Run the global scheduler once, releasing dependents on each rule completion

	logger.AppLogger.Info(telemetry.LogEntry{Message: fmt.Sprintf("Global validation DAG ready: %d rules", len(manager.Rules)), Attributes: map[string]any{"rules": len(manager.Rules)}})
	result.Statuses, err = algorithm.RunRules(manager, state)
	if err != nil {
		execution.CollectErrors(state, "", nil, err)
	}

	//
	// 8. Return only after every started worker has finished and reporting is complete

	return finish(state.Err)
}
