import TextLintTester from "textlint-tester";
import rule from "../src/index";

const tester = new TextLintTester();

tester.run("idiomatic-lines-fuzz", rule, {
    valid: [
        // Single sentences with various internal punctuation that shouldn't split
        "He is a Jr. Dev.",
        "The vol. 1 is out.",
        "e.g. this is a test.",
        "The U.S.A. is a country.",
        "Visit our website at example.com.",
        "Check http://example.com/foo.bar?q=a.b! for details.",
        "This is a sentence (with parentheses).",
        "This is a sentence [with brackets].",
        'She said "Hello." and walked away.',
        "It's 'fine'.",

        // Multiple sentences on separate lines (valid)
        "What?\nNo!\nWhy?",
        "Visit our website at example.com.\nIt is nice.",
        "First sentence.\nSecond sentence.",

        // Footnotes
        "This is a sentence with a footnote[^1].",
        "[^1]: This is the footnote.",

        // More abbreviations
        "The Univ. of Tokyo.",
        "See no. 5 for details.",
        "Edited by Smith et al.",

        // Nested or mixed punctuation
        "He said (it was 'fine').",

        // Complex URLs
        "Check https://example.com/-/media/Images/Logo.png?h=100&w=200 for the logo.",
    ],
    invalid: [
        // Multiple sentences on one line
        {
            text: "Wait (really?)... Yes.",
            output: "Wait (really?)...\nYes.",
            errors: [
                { message: "There should be only one sentence per line. Start a new line after each sentence." }
            ]
        },
        // Multiple sentences on one line
        {
            text: "What? No! Why?",
            output: "What?\nNo!\nWhy?",
            errors: [
                { message: "There should be only one sentence per line. Start a new line after each sentence." },
                { message: "There should be only one sentence per line. Start a new line after each sentence." },
            ]
        },
        // Sentence spanning multiple lines
        {
            text: "Is this a\nquestion?",
            output: "Is this a question?",
            errors: [
                { message: "A sentence should not span multiple lines. Keep each sentence on a single line." }
            ]
        },
        // URL followed by another sentence on the same line
        {
            text: "Go to http://example.com. Then click here.",
            output: "Go to http://example.com.\nThen click here.",
            errors: [
                { message: "There should be only one sentence per line. Start a new line after each sentence." }
            ]
        }
    ],
});
