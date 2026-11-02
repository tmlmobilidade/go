package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/messages"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

func PatternIdField(db *sqlite.SQLiteContext, ruleContext *rules.RuleContext, messageAdder messages.MessageAdder) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_pattern_id_field"

	//
	// 2. Create the validation context

	ctx := context.NewValidationContext("pattern_id", "trips.txt", ruleID, db.Row, messageAdder, ruleContext)

	//
	// 3. Get the pattern_id value

	value, err := queries.Field(db.Trips, "pattern_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the pattern_id is required

	if value == "" {
		if context.ShouldIgnore(ctx) {
			return nil
		}

		context.AddMessage(ctx, context.GetSeverityMessage(ctx, "required", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
