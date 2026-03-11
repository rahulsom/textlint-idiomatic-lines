import { TextlintRuleModule } from "@textlint/types";
import { split, SentenceSplitterSyntax } from "sentence-splitter";

export type Options = Record<string, never>;

const reporter: TextlintRuleModule<Options> = (context) => {
    const { Syntax, report, RuleError, locator, getSource, fixer } = context;

    return {
        [Syntax.Paragraph](node) {
            const originalText = getSource(node);
            // Neutralize sentence-ending punctuation inside inline code spans and
            // image references so sentence-splitter does not treat e.g. `!command`
            // or `![alt](./path/file.png)` as sentence boundaries.
            // Also collapse newlines before image references so image-only lines
            // don't cause false "sentence spans multiple lines" errors.
            // Character-for-character replacement preserves all range/position offsets.
            const text = originalText
                .replace(/\n(?=!\[)/g, " ")
                .replace(/`([^`]*)`/g, (_, content) =>
                    '`' + content.replace(/[.!?]/g, "x") + '`'
                )
                .replace(/!?\[[^\]]*\]\([^)]*\)/g, (match) =>
                    match.replace(/[.!?]/g, "x")
                )
                .replace(/(\*{1,2})([^*]+)\1/g, (match, _stars, content) =>
                    match.replace(content, content.replace(/[.!?]/g, "x"))
                )
                // Neutralise periods in common abbreviations
                .replace(/\b(etc|vs|cf|al|Mr|Ms|Mrs|Dr|Prof|Sr|Jr|St|Co|Corp|Inc|Ph\.D|vol|chap|pp)\./gi, (m) =>
                    m.replace(/\./g, "x")
                )
                // Handle multi-period abbreviations like U.S.A. or i.e. or a.m.
                .replace(/\b([a-z]\.([a-z]\.)+)/gi, (m) =>
                    m.replace(/\./g, "x")
                )
                // Neutralise periods inside quoted strings that appear
                // mid-sentence (closing quote not at end of line and not
                // followed by a new sentence) so they don't become false
                // boundaries when quotes are removed.
                .replace(/"[^"\n]*"(?!\s*($|[A-Z]))/gm, (match) =>
                    match.replace(/[.!?]/g, "x")
                )
                .replace(/'[^'\n]*'(?!\s*($|[A-Z]))/gm, (match) =>
                    match.replace(/[.!?]/g, "x")
                )
                // sentence-splitter suppresses sentence boundaries inside
                // double quotes, parentheses, and underscore emphasis;
                // neutralise them so enclosed periods are still recognised
                // as boundaries. Only replace _ at word boundaries to
                // preserve underscores in identifiers like bb_attachments.
                .replace(/"/g, " ")
                .replace(/'/g, " ")
                .replace(/[()]/g, " ")
                .replace(/(?<=\s|^)_|_(?=\s|$)/gm, " ")
                // sentence-splitter treats periods after digits as decimals;
                // replace the digit before a sentence-ending period with a
                // letter so the splitter recognises the boundary.
                .replace(/(\d)\.(\s+[A-Z])/g, "X.$2")
                // Treat a trailing colon at end-of-line as a sentence
                // boundary so lines like "such as:" are not merged with
                // the following line.
                .replace(/:$/gm, ".")
                // Ensure a boundary is recognised when terminal punctuation
                // is followed immediately by a capital letter without a space.
                // Replace the first character of the next sentence with a newline
                // to force a split while preserving string length and character offsets.
                .replace(/([.!?])([A-Z])/g, "$1\n")
                // Similarly for boundaries inside quotes or parentheses.
                .replace(/([.!?]["')\]])([A-Z])/g, "$1\n");
            const result = split(text);

            const sentences = result.filter(
                (child) => child.type === SentenceSplitterSyntax.Sentence
            );

            if (sentences.length === 0) {
                return;
            }

            const listItemPattern = /^\s*[*+-] /;

            for (const sentence of sentences) {
                if (sentence.loc.start.line !== sentence.loc.end.line) {
                    const sentenceText = originalText.slice(
                        sentence.range[0],
                        sentence.range[1]
                    );
                    const lines = sentenceText.split("\n");
                    if (lines.every((l) => listItemPattern.test(l))) {
                        continue;
                    }
                    report(
                        node,
                        new RuleError(
                            "A sentence should not span multiple lines. Keep each sentence on a single line.",
                            {
                                padding: locator.range([
                                    sentence.range[0],
                                    sentence.range[1],
                                ]),
                                fix: fixer.replaceTextRange(
                                    [sentence.range[0], sentence.range[1]],
                                    sentenceText.replace(/\n/g, " ")
                                ),
                            }
                        )
                    );
                }
            }

            for (let i = 1; i < sentences.length; i++) {
                const prev = sentences[i - 1];
                const curr = sentences[i];

                const between = originalText.slice(prev.range[1], curr.range[0]);
                if (!between.includes("\n")) {
                    const fixText = between.includes(' ') ? between.replace(/ +/, '\n') : '\n' + between;
                    report(
                        node,
                        new RuleError(
                            "There should be only one sentence per line. Start a new line after each sentence.",
                            {
                                padding: locator.range([
                                    curr.range[0],
                                    curr.range[1],
                                ]),
                                fix: fixer.replaceTextRange(
                                    [prev.range[1], curr.range[0]],
                                    fixText
                                ),
                            }
                        )
                    );
                }
            }
        },
    };
};

const rule: TextlintRuleModule<Options> = {
    linter: reporter,
    fixer: reporter,
};

export default rule;
