// Formats Go source from stdin, then aligns each RuleActions block as one column.
package main

import (
	"bytes"
	"fmt"
	"go/ast"
	"go/format"
	"go/parser"
	"go/token"
	"io"
	"os"
	"sort"
	"strings"
)

type alignment struct {
	start, end, width int
}

func formatSource(source []byte) ([]byte, error) {
	formatted, err := format.Source(source)
	if err != nil {
		return nil, err
	}
	positions := token.NewFileSet()
	file, err := parser.ParseFile(positions, "", formatted, parser.ParseComments)
	if err != nil {
		return nil, err
	}
	var edits []alignment
	ast.Inspect(file, func(node ast.Node) bool {
		literal, ok := node.(*ast.CompositeLit)
		if !ok {
			return true
		}
		var name string
		switch kind := literal.Type.(type) {
		case *ast.SelectorExpr:
			name = kind.Sel.Name
		case *ast.Ident:
			name = kind.Name
		}
		if name != "RuleActions" {
			return true
		}
		var entries []alignment
		maxWidth := 0
		for _, element := range literal.Elts {
			entry, ok := element.(*ast.KeyValueExpr)
			if !ok {
				continue
			}
			if _, ok := entry.Value.(*ast.FuncLit); !ok {
				continue
			}
			key := positions.Position(entry.Key.Pos())
			colon := positions.Position(entry.Colon)
			value := positions.Position(entry.Value.Pos())
			// Leave inline entries, intervening comments and multiline keys alone.
			if key.Line <= positions.Position(literal.Lbrace).Line || key.Line != value.Line || len(bytes.TrimSpace(formatted[colon.Offset+1:value.Offset])) != 0 {
				continue
			}
			width := colon.Column - key.Column + 1
			maxWidth = max(maxWidth, width)
			entries = append(entries, alignment{colon.Offset + 1, value.Offset, width})
		}
		for _, entry := range entries {
			entry.width = maxWidth - entry.width + 1
			edits = append(edits, entry)
		}
		return true
	})
	// Work backwards so replacements do not invalidate earlier byte offsets.
	sort.Slice(edits, func(i, j int) bool { return edits[i].start > edits[j].start })
	for _, edit := range edits {
		formatted = append(append(append([]byte{}, formatted[:edit.start]...), strings.Repeat(" ", edit.width)...), formatted[edit.end:]...)
	}
	return formatted, nil
}

func main() {
	source, err := io.ReadAll(os.Stdin)
	if err == nil {
		source, err = formatSource(source)
	}
	if err == nil {
		_, err = os.Stdout.Write(source)
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
