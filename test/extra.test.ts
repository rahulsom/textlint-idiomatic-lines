import TextLintTester from "textlint-tester";
import rule from "../src/index";

const tester = new TextLintTester();

tester.run("idiomatic-lines-extra", rule, {
    valid: [
        // Single quotes as apostrophes
        "It's a beautiful day.",
        "Don't stop me now.",
        "The programmers' favorite tool.",
        "They're coming home.",
        "It's the users' choice.",
        "He's a 'nice' guy.", // Apostrophe + quoted word

        // Nested emphasis and links
        "This is **important [link](http://example.com)**.",

        // Question and exclamation marks combined
        "Is it really?!",

        // Abbreviations
        "Mr. Smith is here.",
        "Ms. Jones is there.",
        "Mrs. White joined.",
        "Dr. Brown arrived.",
        "Prof. Green teaches.",
        "Sr. Manager here.",
        "Jr. Developer there.",
        "St. Patrick's Day.",
        "The Co. is big.",
        "Inc. is included.",
        "Corp. policy.",

        // Japanese sentences
        "これはペンです。\nそれは本です。",

        // Sentences with semicolons not at the end
        "This is a sentence; it has a semicolon.",

        // Sentence with a lot of spaces
        "Sentence one.       ",

        // Nested quotes (should stay on one line if they don't contain a full sentence followed by another)
        "He said, 'I told her \"No.\"' and left.",
    ],
    invalid: [
        {
            // Single quotes containing period (start of line)
            text: "'Hello.' She replied.",
            output: "'Hello.'\nShe replied.",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        },
        {
            // Single quotes containing period (mid line)
            text: "He said 'Hello.' She replied.",
            output: "He said 'Hello.'\nShe replied.",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        },
        {
            // Double quotes containing period that SHOULD split
            text: 'He said "Hello." She replied.',
            output: 'He said "Hello."\nShe replied.',
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        },
        {
            // Multiple sentences without space
            text: "First sentence.Second sentence.",
            output: "First sentence.\nSecond sentence.",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        },
        {
            // Multiple punctuation marks followed by another sentence
            text: "Really?! Yes.",
            output: "Really?!\nYes.",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        },
        {
            // Parentheses with period that SHOULD split
            text: "(Wait.) Go.",
            output: "(Wait.)\nGo.",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        }
    ]
});
