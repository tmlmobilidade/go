package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestFeedLangField(t *testing.T) {
	validationutils.FeedInfoCheckPresence(t, "feed_lang", fields.FeedLangField)
}
