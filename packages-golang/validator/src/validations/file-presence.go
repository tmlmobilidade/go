package validations

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	validationTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/validations"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables/i18n"
)

// TablesFilePresence adds a presence gate for each supported GTFS table.
// Only explicit depends_on entries make other rules wait for these gates.
func TablesFilePresence(checks validationTypes.RuleChecks) {
	//

	//
	// 1. Iterate over each supported GTFS table

	for _, table := range variables.GtfsRuleFiles {
		id := table + "_file_missing"
		checks[id] = func(ctx *types.ValidationContext) error {
			//
			// 2. Pass when the imported table exists

			exists, err := queries.TableExists(ctx.DB, table)
			if err != nil {
				return err
			}
			if exists {
				return nil
			}

			//
			// 3. Set the missing-file diagnostic context

			ctx.FileName = table + ".txt"
			ctx.Field = "N/A"
			ctx.Failed = true

			//
			// 4. Add the missing-file diagnostic message

			if !context.ShouldIgnore(ctx) {
				context.AddMessage(ctx, i18n.AppTranslator.Get("file_missing.message", ctx.FileName))
			}

			//
			// 5. Return success

			return nil
		}
	}
}
