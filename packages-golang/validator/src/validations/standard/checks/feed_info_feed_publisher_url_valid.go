package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func FeedPublisherUrlValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "feed_info_feed_publisher_url_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("feed_publisher_url", "feed_info.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the feed_publisher_url value

	value, err := db.FeedInfo.Field("feed_publisher_url")
	if err != nil {
		return err
	}

	//
	// 4. Check if the feed_publisher_url is valid

	if !lib.ValidateUrl(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
