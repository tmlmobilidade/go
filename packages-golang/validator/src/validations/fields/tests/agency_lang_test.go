package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyLangField(t *testing.T) {
	validationutils.AgencyCheckPresence(t, "agency_lang", fields.AgencyLangField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_lang_field": config}
	})
}
