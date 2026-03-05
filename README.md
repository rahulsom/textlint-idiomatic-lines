# textlint-rule-idiomatic-lines

[![NPM Version](https://img.shields.io/npm/v/textlint-rule-idiomatic-lines?style=for-the-badge)](https://www.npmjs.com/package/textlint-rule-idiomatic-lines)
[![GitHub commits since latest release](https://img.shields.io/github/commits-since/rahulsom/textlint-idiomatic-lines/latest?style=for-the-badge)](https://github.com/rahulsom/textlint-idiomatic-lines/releases/new)

A [textlint](https://textlint.org/) rule that enforces **one sentence per line** and **one line per sentence**.

This style, sometimes called [semantic linefeeds](https://rhodesmill.org/brandon/2012/one-sentence-per-line/), makes prose easier to diff, review, and rearrange in version control.

## Rules

The rule reports two kinds of violations:

**Multiple sentences on one line**
Two or more sentences appear on the same line.

Bad:
```
The sky is blue. The grass is green.
```

Good:
```
The sky is blue.
The grass is green.
```

**Sentence spanning multiple lines**
A single sentence is broken across lines without a blank line (paragraph break) between them.

Bad:
```
The sky is a lovely shade
of blue today.
```

Good:
```
The sky is a lovely shade of blue today.
```

## Installation

```sh
npm install textlint-rule-idiomatic-lines
```

## Usage

Add the rule to your `.textlintrc.json`:

```json
{
  "rules": {
    "idiomatic-lines": true
  }
}
```

Then run textlint:

```sh
npx textlint "docs/**/*.md"
```

## Scope

The rule only inspects **Paragraph** nodes in the Markdown AST.
The following constructs are _not_ checked and will never produce false positives:

- Headings
- List items
- Fenced code blocks
- Indented code blocks
- Inline code spans (e.g. `obj.method()`)

Blockquote content _is_ checked, because blockquotes contain paragraphs.

## Sentence detection

Sentence boundaries are detected by [sentence-splitter](https://github.com/textlint-ja/sentence-splitter).
It handles common abbreviations (`Dr.`, `Mr.`, `e.g.`), decimal numbers (`3.14`), and ellipses (`...`).

## Development

This project uses [node-tool-wrapper](https://github.com/rahulsom/node-tool-wrapper) so you don't need Node.js or npm installed globally.

```sh
./npmw install
./npmw test        # run unit + integration tests
./npmw run build   # compile TypeScript to lib/
```

## License

MIT
