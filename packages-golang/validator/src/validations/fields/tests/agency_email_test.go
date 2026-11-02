package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
	"testing"
)

func TestAgencyEmailField(t *testing.T) {
	validationutils.AgencyCheckPresence(t, "agency_email", fields.AgencyEmailField, func(config types.RuleContext) *types.GtfsRules {
		return &types.GtfsRules{"agency_email_field": config}
	})
}
