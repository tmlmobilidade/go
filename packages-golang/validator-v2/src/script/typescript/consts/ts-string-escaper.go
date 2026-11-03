package consts

import "strings"

var TsStringEscaper = strings.NewReplacer(`\`, `\\`, "'", `\'`, "\n", `\n`, "\r", `\r`)