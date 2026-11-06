package validators

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/lib/validators/utils"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
)

func ValidateLicensePlate(licensePlate string) bool {
	licensePlate = utils.NormalizeLicensePlate(licensePlate)

	if len(licensePlate) != 6 {
		return false
	}

	return variables.PlateRegex.MatchString(licensePlate)
}
