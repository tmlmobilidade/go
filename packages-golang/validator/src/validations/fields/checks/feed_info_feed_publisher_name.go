package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func FeedPublisherNameField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_feed_publisher_name_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("feed_publisher_name", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the feed_publisher_name value

	value, err := db.FeedInfo.Field("feed_publisher_name")
	if err != nil {
		return err
	}

	//
	// 4. Check if the feed_publisher_name is required

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}

		ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("required", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
