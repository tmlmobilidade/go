package fields_test

import (
	fields "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/fields/checks"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"testing"
)

func TestHeadwaySecsField(t *testing.T) {
	validationutils.FrequenciesCheckPresence(t, "headway_secs", fields.HeadwaySecsField)
}
