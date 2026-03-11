import TextLintTester from "textlint-tester";
import rule from "../src/index";

const tester = new TextLintTester();

tester.run("idiomatic-lines-failure", rule, {
    valid: [
        "This is a sentence.",
    ],
    invalid: [
        {
            text: 'He said "Hello." She said "Hi."',
            output: 'He said "Hello."\nShe said "Hi."',
            errors: [
                {
                    message: "There should be only one sentence per line. Start a new line after each sentence.",
                },
            ],
        },
    ],
});
