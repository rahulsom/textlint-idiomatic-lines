import { TextlintRuleModule } from "@textlint/types";
import { split, SentenceSplitterSyntax } from "sentence-splitter";

export type Options = Record<string, never>;

const rule: TextlintRuleModule<Options> = (context) => {
    const { Syntax, report, RuleError, locator, getSource } = context;

    return {
        [Syntax.Paragraph](node) {
            // Neutralize sentence-ending punctuation inside inline code spans so
            // sentence-splitter does not treat e.g. `!command` as a sentence boundary.
            // Character-for-character replacement preserves all range/position offsets.
            const text = getSource(node).replace(/`([^`]*)`/g, (_, content) =>
                '`' + content.replace(/[.!?]/g, "x") + '`'
            );
            const result = split(text);

            const sentences = result.filter(
                (child) => child.type === SentenceSplitterSyntax.Sentence
            );

            if (sentences.length === 0) {
                return;
            }

            for (const sentence of sentences) {
                if (sentence.loc.start.line !== sentence.loc.end.line) {
                    report(
                        node,
                        new RuleError(
                            "A sentence should not span multiple lines. Keep each sentence on a single line.",
                            {
                                padding: locator.range([
                                    sentence.range[0],
                                    sentence.range[1],
                                ]),
                            }
                        )
                    );
                }
            }

            for (let i = 1; i < sentences.length; i++) {
                const prev = sentences[i - 1];
                const curr = sentences[i];

                if (curr.loc.start.line === prev.loc.end.line) {
                    report(
                        node,
                        new RuleError(
                            "There should be only one sentence per line. Start a new line after each sentence.",
                            {
                                padding: locator.range([
                                    curr.range[0],
                                    curr.range[1],
                                ]),
                            }
                        )
                    );
                }
            }
        },
    };
};

export default rule;
