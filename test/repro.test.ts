import TextLintTester from "textlint-tester";
import rule from "../src/index";

const tester = new TextLintTester();

tester.run("idiomatic-lines-repro", rule, {
    valid: [
        "The U.S. is a country.",
        "The U.S.A. is also a country.",
        "He has a Ph.D. in physics.",
        "It costs $5 i.e. five dollars.",
        "Meet at 10 a.m. tomorrow.",
        "Check etc. for more info.",
        "The U.S. and the U.K. are allies.",
    ],
    invalid: [
        {
            // Missing space after period
            text: "Sentence one.Sentence two.",
            output: "Sentence one.\nSentence two.",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        },
        {
            // Missing space after question mark
            text: "Really?Yes.",
            output: "Really?\nYes.",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        },
        {
            // Missing space after exclamation mark
            text: "Wow!Great.",
            output: "Wow!\nGreat.",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        },
        {
            // Forced split should not lose characters
            text: "End.Start",
            output: "End.\nStart",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        }
    ]
});
