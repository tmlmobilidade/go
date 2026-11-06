package validators

import (
	"net/url"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validators/utils"
)

func ValidateUrl(u string) bool {
	u = strings.TrimSpace(u)
	if u == "" {
		return false
	}

	// Disallowed characters (RFC 3986 + common breakages)
	if strings.ContainsAny(u, ` "<>{}|"'\^`) {
		return false
	}

	// Validate percent-encoding
	for i := 0; i < len(u); i++ {
		if u[i] == '%' {
			if i+2 >= len(u) ||
				!utils.IsHex(u[i+1]) ||
				!utils.IsHex(u[i+2]) {
				return false
			}
			i += 2
		}
	}

	parsedUrl, err := url.ParseRequestURI(u)
	if err != nil {
		return false
	}

	if parsedUrl.Scheme != "http" && parsedUrl.Scheme != "https" {
		return false
	}

	if parsedUrl.Host == "" {
		return false
	}

	return true
}