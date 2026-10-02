package main

import (
	"bytes"
	"go/scanner"
	"go/token"
	"strings"
	"testing"
)

func TestRuleActionsAlignment(t *testing.T) {
	source := []byte("package example\nfunc run() {\n_ = services.RuleActions{\n\"id\": func() {},\n\"a_much_longer_rule_name_for_alignment\": func() {\nprintln(`keep  this text`)\n},\n\"other\": func() {},\n}\n}\n")
	formatted, err := formatSource(source)
	if err != nil {
		t.Fatal(err)
	}
	column := -1
	for _, line := range strings.Split(string(formatted), "\n") {
		if strings.Contains(line, "\":") {
			current := strings.Index(line, "func()")
			if column >= 0 && current != column {
				t.Fatalf("functions are not aligned:\n%s", formatted)
			}
			column = current
		}
	}
	if !bytes.Equal(tokens(source), tokens(formatted)) {
		t.Fatal("formatting changed Go tokens")
	}
	again, err := formatSource(formatted)
	if err != nil || !bytes.Equal(formatted, again) {
		t.Fatalf("formatting is not stable: %v", err)
	}
}

func TestInvalidSource(t *testing.T) {
	if output, err := formatSource([]byte("package example\nfunc {")); err == nil || output != nil {
		t.Fatal("invalid source must fail without replacement output")
	}
}

func tokens(source []byte) []byte {
	positions := token.NewFileSet()
	file := positions.AddFile("", -1, len(source))
	var scan scanner.Scanner
	scan.Init(file, source, nil, scanner.ScanComments)
	var result bytes.Buffer
	for {
		_, kind, literal := scan.Scan()
		if kind == token.EOF {
			return result.Bytes()
		}
		result.WriteString(kind.String() + "\x00" + literal + "\x00")
	}
}
