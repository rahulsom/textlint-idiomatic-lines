import TextLintTester from "textlint-tester";
import rule from "../src/index";

const tester = new TextLintTester();

tester.run("idiomatic-lines", rule, {
    valid: [
        // Single sentence
        "This is a sentence.",

        // Single sentence with exclamation
        "Hello world!",

        // Single sentence with question mark
        "How are you?",

        // Single word (no sentence-ending punctuation)
        "Hello",

        // Two sentences, each on its own line
        "Sentence one.\nSentence two.",

        // Three sentences, each on its own line
        "First.\nSecond.\nThird.",

        // Different punctuation on separate lines
        "How are you?\nI am fine.\nGreat!",

        // Sentence with abbreviation (should not split on "Dr.")
        "Dr. Smith went to the store.",

        // Sentence with decimal number
        "The value of pi is 3.14 approximately.",

        // Multiple paragraphs (separated by blank line)
        "First paragraph.\n\nSecond paragraph.",

        // Multiple paragraphs with multiple sentences each on own lines
        "First sentence.\nSecond sentence.\n\nThird sentence.\nFourth sentence.",

        // Sentence with inline code
        "Use the `console.log` function.",

        // Sentence with emphasis
        "This is **very** important.",

        // Sentence with a link
        "Visit [the website](http://example.com) for more.",

        // Sentence with ellipsis at the end
        "Wait for it...",

        // Heading (not a paragraph, should not be checked)
        "# This is a heading",

        // List items (not paragraphs, should not be checked)
        "- Item one\n- Item two\n- Item three",

        // Blockquote with single sentence
        "> This is a quote.",

        // Sentence with parenthetical
        "This is a sentence (with a note) that continues.",

        // Sentence ending with quoted text
        'He said "hello" to everyone.',

        // Sentence with colon
        "There are three things: apples, oranges, and bananas.",

        // Sentence with semicolon
        "I came; I saw; I conquered.",

        // Single character
        "A",

        // Sentence with inline code containing a bang prefix (e.g. Slack command)
        "To get our attention, post `!oncall ci-dev` in a thread with a link to your PR.",
    ],
    invalid: [
        // Two sentences on one line
        {
            text: "Hello world. Goodbye world.",
            output: "Hello world.\nGoodbye world.",
            errors: [
                {
                    message:
                        "There should be only one sentence per line. Start a new line after each sentence.",
                },
            ],
        },

        // Three sentences on one line
        {
            text: "One. Two. Three.",
            output: "One.\nTwo.\nThree.",
            errors: [
                {
                    message:
                        "There should be only one sentence per line. Start a new line after each sentence.",
                },
                {
                    message:
                        "There should be only one sentence per line. Start a new line after each sentence.",
                },
            ],
        },

        // Sentence spanning two lines
        {
            text: "This is a sentence\nthat spans two lines.",
            output: "This is a sentence that spans two lines.",
            errors: [
                {
                    message:
                        "A sentence should not span multiple lines. Keep each sentence on a single line.",
                },
            ],
        },

        // Sentence spanning three lines
        {
            text: "This is\na sentence that\nspans three lines.",
            output: "This is a sentence that spans three lines.",
            errors: [
                {
                    message:
                        "A sentence should not span multiple lines. Keep each sentence on a single line.",
                },
            ],
        },

        // Two sentences with exclamation on one line
        {
            text: "Wow! That is great!",
            output: "Wow!\nThat is great!",
            errors: [
                {
                    message:
                        "There should be only one sentence per line. Start a new line after each sentence.",
                },
            ],
        },

        // Question and answer on one line
        {
            text: "Really? Yes.",
            output: "Really?\nYes.",
            errors: [
                {
                    message:
                        "There should be only one sentence per line. Start a new line after each sentence.",
                },
            ],
        },

        // First sentence ok, second spans lines
        {
            text: "Hello.\nThis sentence\nspans two lines.",
            output: "Hello.\nThis sentence spans two lines.",
            errors: [
                {
                    message:
                        "A sentence should not span multiple lines. Keep each sentence on a single line.",
                },
            ],
        },

        // Both violations: two sentences on first line, second spans to next
        {
            text: "First. Second sentence\ncontinues here.",
            output: "First.\nSecond sentence continues here.",
            errors: [
                {
                    message:
                        "A sentence should not span multiple lines. Keep each sentence on a single line.",
                },
                {
                    message:
                        "There should be only one sentence per line. Start a new line after each sentence.",
                },
            ],
        },

        // Four sentences on one line
        {
            text: "Stop now. Go home. Eat food. Sleep well.",
            output: "Stop now.\nGo home.\nEat food.\nSleep well.",
            errors: [
                {
                    message:
                        "There should be only one sentence per line. Start a new line after each sentence.",
                },
                {
                    message:
                        "There should be only one sentence per line. Start a new line after each sentence.",
                },
                {
                    message:
                        "There should be only one sentence per line. Start a new line after each sentence.",
                },
            ],
        },

        // Ellipsis as sentence boundary on one line
        {
            text: "Wait for it... and see what happens.",
            output: "Wait for it...\nand see what happens.",
            errors: [
                {
                    message:
                        "There should be only one sentence per line. Start a new line after each sentence.",
                },
            ],
        },

        // Sentence with emphasis spanning lines
        {
            text: "This is **really\nimportant** stuff.",
            output: "This is **really important** stuff.",
            errors: [
                {
                    message:
                        "A sentence should not span multiple lines. Keep each sentence on a single line.",
                },
            ],
        },

        // Multiple sentences with a link on one line
        {
            text: "Visit [here](http://example.com). Then click submit.",
            output: "Visit [here](http://example.com).\nThen click submit.",
            errors: [
                {
                    message:
                        "There should be only one sentence per line. Start a new line after each sentence.",
                },
            ],
        },
    ],
});
