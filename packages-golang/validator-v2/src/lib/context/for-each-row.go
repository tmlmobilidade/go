package context

import (
	"fmt"
	"time"

	telemetry "github.com/tmlmobilidade/go/packages-golang/telemetry/src"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables/logger"
)

// HasTable checks shared metadata without opening a cursor or changing scheduling.
func HasTable(ctx *ValidationContext, name string) bool {
	return ctx != nil && ctx.Tables != nil && ctx.Tables.Tables[name] != nil
}

// ForEachRow creates a scoped child context for each row selected by the rule.
// Table and field selection stays inside the implementation, not in the scheduler.
func ForEachRow(ctx *ValidationContext, tableName string, fields []string, check func(*ValidationContext) error) error {
	//

	//
	// 1. Require a rule context and leave unavailable source tables for file checks

	if ctx == nil || ctx.Tables == nil || ctx.MessageAdder == nil || check == nil {
		return fmt.Errorf("row validation requires a context, tables, messages, and callback")
	}
	ctx.FileName = tableName + ".txt"
	ctx.Field = ""
	if len(fields) > 0 {
		ctx.Field = fields[0]
	}
	if !HasTable(ctx, tableName) {
		ctx.Skipped = true
		return nil
	}
	table := ctx.Tables.Tables[tableName]

	//
	// 2. Read bounded batches, releasing SQLite cursors before each callback

	checked := 0
	lastProgress := time.Now()
	err := queries.ForEachRowFields(table, fields, func(source *sqliteTypes.SQLiteRow) (err error) {
		child := *ctx
		child.Config = cloneConfig(ctx.Config)
		child.Source = source
		child.Row = source.Row
		child.Failed = false
		child.Skipped = false

		//
		// 3. Preserve source locations and propagate child findings to the whole rule

		defer func() {
			if recovered := recover(); recovered != nil {
				err = fmt.Errorf("validation panicked: %v", recovered)
			}
			if child.Failed {
				ctx.Failed = true
			}
			if child.Skipped {
				ctx.Skipped = true
			}
			if err != nil {
				ctx.Failed = true
				err = &rowError{details: types.RowError{Table: tableName, Row: source.Row, Field: child.Field, Err: err}}
			}
		}()
		if err = check(&child); err != nil {
			return err
		}
		checked++
		if time.Since(lastProgress) >= 5*time.Second {
			logger.AppLogger.Progress(telemetry.LogEntry{Message: fmt.Sprintf("Running %s: %d rows checked", ctx.RuleID, checked), Attributes: map[string]any{"rule_id": ctx.RuleID, "table": tableName, "checked_rows": checked}})
			lastProgress = time.Now()
		}
		return nil
	})
	if err != nil {
		ctx.Failed = true
	}
	return err
}
