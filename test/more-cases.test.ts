import TextLintTester from "textlint-tester";
import rule from "../src/index";

const tester = new TextLintTester();

tester.run("idiomatic-lines-extra", rule, {
    valid: [
        // U.S. abbreviation
        "The U.S. is a country.",
        // Multiple abbreviations
        "The U.S.A. is also a country.",
        // Ph.D.
        "He has a Ph.D. in physics.",
        "Line one.",
        "Line two.",
    ],
    invalid: [
        {
            text: "Line one\nLine two",
            output: "Line one Line two",
            errors: [
                {
                    message: "A sentence should not span multiple lines. Keep each sentence on a single line.",
                },
            ],
        },
        {
            text: "The U.S. is a country. It is big.",
            output: "The U.S. is a country.\nIt is big.",
            errors: [
                {
                    message: "There should be only one sentence per line. Start a new line after each sentence.",
                },
            ],
        },
        {
            // Sentence ending with abbreviation followed by another sentence on same line
            text: "Go to the U.S. Then go to Canada.",
            output: "Go to the U.S.\nThen go to Canada.",
            errors: [
                {
                    message: "There should be only one sentence per line. Start a new line after each sentence.",
                },
            ],
        }
    ],
});
