package context

import (
	"fmt"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
* RequireTables checks a rule's source and lookup tables before it starts reading.
* Missing tables skip the rule; invalid contexts and database failures return errors.
 */
func RequireTables(ctx *ValidationContext, names ...string) (bool, error) {
	if ctx == nil || ctx.DB == nil || ctx.MessageAdder == nil {
		return false, fmt.Errorf("validation requires a context, database, and message receiver")
	}
	for _, name := range names {
		exists, err := queries.TableExists(ctx.DB, name)
		if err != nil {
			return false, err
		}
		if !exists {
			ctx.Skipped = true
			return false, nil
		}
	}
	return true, nil
}
