import { TextlintRuleModule } from "@textlint/types";
import { split, SentenceSplitterSyntax } from "sentence-splitter";

export type Options = {
    [key: string]: any;
};

const reporter: TextlintRuleModule<Options> = (context) => {
    const { Syntax, report, RuleError, locator, getSource, fixer } = context;

    const abbreviations = new Set([
        "dr", "mr", "mrs", "ms", "prof", "sr", "jr",
        "eg", "ie", "etc", "vs", "cf", "al", "ph.d",
        "e.g", "i.e", "u.s", "u.s.a"
    ]);

    const isAbbreviation = (text: string) => {
        const match = text.match(/\b([a-z][a-z.]*)\.?$/i);
        if (!match) return false;
        const word = match[1].toLowerCase().replace(/\.$/, "");
        return abbreviations.has(word) || word.length === 1;
    };

    return {
        [Syntax.Paragraph](node) {
            const originalText = getSource(node);

            const neutralizedText = originalText
                .replace(/`[^`]*`/g, (m) => " ".repeat(m.length))
                .replace(/!\[[^\]]*\]\([^)]*\)/g, (m) => " ".repeat(m.length))
                .replace(/\[[^\]]*\]\([^)]*\)/g, (m) => " ".repeat(m.length));

            const sentences = split(neutralizedText).filter(s => s.type === SentenceSplitterSyntax.Sentence);

            for (let i = 0; i < sentences.length; i++) {
                const s = sentences[i];
                const sText = originalText.slice(s.range[0], s.range[1]);

                // 1. Spanning check
                if (sText.includes("\n")) {
                    const lines = sText.split("\n");
                    let isViolation = false;
                    for (let j = 0; j < lines.length - 1; j++) {
                        const line = lines[j].trim();
                        if (line === "") continue;
                        if (/[.!?]["')\]_*]*$/.test(line) || line.endsWith(":")) {
                             if (line.endsWith(".") && isAbbreviation(line)) {
                                 isViolation = true;
                                 break;
                             }
                             continue;
                        }
                        const nextLine = lines[j+1].trim();
                        if (/^(!\[|\[|[*+-]\s+|\d+\.\s+|<|<b>)/.test(nextLine)) continue;
                        isViolation = true;
                        break;
                    }
                    if (isViolation) {
                        report(node, new RuleError("A sentence should not span multiple lines. Keep each sentence on a single line.", {
                            padding: locator.range([s.range[0], s.range[1]]),
                            fix: fixer.replaceTextRange([s.range[0], s.range[1]], sText.replace(/\n/g, " "))
                        }));
                    }
                }

                // 2. Multiple sentences on one line (between split sentences)
                if (i > 0) {
                    const prev = sentences[i-1];
                    const between = originalText.slice(prev.range[1], s.range[0]);
                    if (!between.includes("\n")) {
                        // Skip if the "between" text is just Markdown markers like "**" that sentence-splitter over-split
                        if (originalText.slice(prev.range[1], s.range[1]).trim() === "**") {
                             // This is likely just closing bold markers
                        } else {
                            report(node, new RuleError("There should be only one sentence per line. Start a new line after each sentence.", {
                                padding: locator.range([s.range[0], s.range[1]]),
                                fix: fixer.replaceTextRange([prev.range[1], s.range[0]], "\n")
                            }));
                        }
                    }
                }

                // 3. Mid-line violations within a single "sentence"
                const boundaryRegex = /([.!?]["')\]_*]*)(\s+)([A-Z0-9("])/g;
                let match;
                while ((match = boundaryRegex.exec(sText)) !== null) {
                    const punctuation = match[1];
                    const whitespace = match[2];
                    if (whitespace.includes("\n")) continue;

                    const before = sText.slice(0, match.index + punctuation.length);
                    if (punctuation.includes(".") && isAbbreviation(before)) continue;

                    const beforeText = sText.slice(0, match.index);
                    if ((beforeText.split("*").length - 1) % 2 !== 0 || (beforeText.split("_").length - 1) % 2 !== 0) continue;

                    report(node, new RuleError("There should be only one sentence per line. Start a new line after each sentence.", {
                        padding: locator.range([s.range[0] + match.index + punctuation.length + whitespace.length, s.range[1]]),
                        fix: fixer.replaceTextRange([s.range[0] + match.index + punctuation.length, s.range[0] + match.index + punctuation.length + whitespace.length], "\n")
                    }));
                }
            }
        }
    };
};

const rule: TextlintRuleModule<Options> = {
    linter: reporter,
    fixer: reporter,
};

export default rule;
