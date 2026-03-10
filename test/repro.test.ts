import TextLintTester from "textlint-tester";
import rule from "../src/index";

const tester = new TextLintTester();

tester.run("idiomatic-lines-repro", rule, {
    valid: [
        "Mr. Smith went to Washington.",
        "Mrs. Robinson, you're trying to seduce me.",
        "Ms. Marvel is a superhero.",
        "Prof. Plum was in the library with the candlestick.",
        "St. Patrick's Day is in March.",
        "The store is on 5th Ave.",
        "I live on Main Rd.",
        "Apple Inc. is a big company.",
        "I work for Acme Co. today.",
        "The project is by Smith et al. in 2023.",
        // URLs at end of sentence should be fine if they are the only thing on the line
        "Check out https://example.com.",
        "It's a great site.",
    ],
    invalid: [
        {
            // Multiple sentences with parentheses - should be split if there are multiple periods
            text: "This is a sentence. (It's in parentheses).",
            output: "This is a sentence.\n(It's in parentheses).",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        },
        {
            text: "He said 'Hello. How are you?'",
            output: "He said 'Hello.\nHow are you?'",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        },
        {
            text: "First. Second. Third.",
            output: "First.\nSecond.\nThird.",
            errors: [
                { message: "There should be only one sentence per line. Start a new line after each sentence." },
                { message: "There should be only one sentence per line. Start a new line after each sentence." }
            ]
        },
        {
            text: "Acme Ltd. is a great company. It makes everything.",
            output: "Acme Ltd. is a great company.\nIt makes everything.",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        },
        {
            text: "Check out https://example.com. It's a great site.",
            output: "Check out https://example.com.\nIt's a great site.",
            errors: [{ message: "There should be only one sentence per line. Start a new line after each sentence." }]
        }
    ]
});
