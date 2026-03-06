import { createLinter } from "textlint";
import { TextlintKernelDescriptor } from "@textlint/kernel";
import markdownPlugin from "@textlint/textlint-plugin-markdown";
import { expect } from "chai";
import * as path from "path";
import * as fs from "fs";
import rule from "../src/index";

const fixturesDir = path.join(__dirname, "fixtures");

function readFixture(name: string): string {
    return fs.readFileSync(path.join(fixturesDir, name), "utf-8");
}

function buildLinter() {
    const descriptor = new TextlintKernelDescriptor({
        rules: [{ ruleId: "idiomatic-lines", rule, options: true }],
        filterRules: [],
        plugins: [
            {
                pluginId: "@textlint/textlint-plugin-markdown",
                plugin: markdownPlugin,
                options: true,
            },
        ],
    });
    return createLinter({ descriptor });
}

describe("integration: lintFiles", () => {
    const linter = buildLinter();

    describe("valid fixtures", () => {
        it("valid-simple.md has no errors", async () => {
            const results = await linter.lintFiles([
                path.join(fixturesDir, "valid-simple.md"),
            ]);
            expect(results).to.have.lengthOf(1);
            expect(results[0].messages).to.be.empty;
        });

        it("valid-rich-markdown.md has no errors", async () => {
            const results = await linter.lintFiles([
                path.join(fixturesDir, "valid-rich-markdown.md"),
            ]);
            expect(results).to.have.lengthOf(1);
            expect(results[0].messages).to.be.empty;
        });

        it("valid-lists-and-headings.md has no errors", async () => {
            const results = await linter.lintFiles([
                path.join(fixturesDir, "valid-lists-and-headings.md"),
            ]);
            expect(results).to.have.lengthOf(1);
            expect(results[0].messages).to.be.empty;
        });
    });

    describe("invalid fixtures", () => {
        it("invalid-multiple-per-line.md reports one error on the two-sentence line", async () => {
            const results = await linter.lintFiles([
                path.join(fixturesDir, "invalid-multiple-per-line.md"),
            ]);
            expect(results).to.have.lengthOf(1);
            const messages = results[0].messages;
            expect(messages).to.have.lengthOf(1);
            expect(messages[0].message).to.match(/only one sentence per line/);
            expect(messages[0].loc.start.line).to.equal(3);
        });

        it("invalid-spanning-lines.md reports one error for the spanning sentence", async () => {
            const results = await linter.lintFiles([
                path.join(fixturesDir, "invalid-spanning-lines.md"),
            ]);
            expect(results).to.have.lengthOf(1);
            const messages = results[0].messages;
            expect(messages).to.have.lengthOf(1);
            expect(messages[0].message).to.match(
                /should not span multiple lines/
            );
            expect(messages[0].loc.start.line).to.equal(3);
        });

        it("invalid-mixed.md reports errors for both violation types", async () => {
            const results = await linter.lintFiles([
                path.join(fixturesDir, "invalid-mixed.md"),
            ]);
            expect(results).to.have.lengthOf(1);
            const messages = results[0].messages;

            const multiPerLine = messages.filter((m) =>
                /only one sentence per line/.test(m.message)
            );
            const spanning = messages.filter((m) =>
                /should not span multiple lines/.test(m.message)
            );

            expect(multiPerLine).to.have.length.at.least(3);
            expect(spanning).to.have.length.at.least(1);
        });

        it("invalid-complex-document.md reports errors only in offending paragraphs", async () => {
            const results = await linter.lintFiles([
                path.join(fixturesDir, "invalid-complex-document.md"),
            ]);
            expect(results).to.have.lengthOf(1);
            const messages = results[0].messages;

            expect(messages).to.have.length.at.least(3);

            const multiPerLine = messages.filter((m) =>
                /only one sentence per line/.test(m.message)
            );
            const spanning = messages.filter((m) =>
                /should not span multiple lines/.test(m.message)
            );

            expect(multiPerLine).to.have.lengthOf(2);
            expect(spanning).to.have.lengthOf(1);
        });
    });
});

describe("integration: fixText", () => {
    const linter = buildLinter();

    it("fixes multiple sentences on one line by inserting newlines", async () => {
        const result = await linter.fixText(
            "First sentence. Second sentence.\n",
            "test.md"
        );
        expect(result.output).to.equal("First sentence.\nSecond sentence.\n");
    });

    it("fixes a sentence spanning lines by joining with spaces", async () => {
        const result = await linter.fixText(
            "This is a sentence\nthat spans two lines.\n",
            "test.md"
        );
        expect(result.output).to.equal(
            "This is a sentence that spans two lines.\n"
        );
    });

    it("fixes both violation types in the same paragraph", async () => {
        const result = await linter.fixText(
            "First. Second sentence\ncontinues here.\n",
            "test.md"
        );
        expect(result.output).to.equal(
            "First.\nSecond sentence continues here.\n"
        );
    });

    it("fixes four sentences on one line", async () => {
        const result = await linter.fixText(
            "Stop now. Go home. Eat food. Sleep well.\n",
            "test.md"
        );
        expect(result.output).to.equal(
            "Stop now.\nGo home.\nEat food.\nSleep well.\n"
        );
    });

    it("does not modify already-valid text", async () => {
        const text = "First sentence.\nSecond sentence.\n";
        const result = await linter.fixText(text, "test.md");
        expect(result.output).to.equal(text);
    });

    it("handles emphasis spanning lines", async () => {
        const result = await linter.fixText(
            "This is **really\nimportant** stuff.\n",
            "test.md"
        );
        expect(result.output).to.equal(
            "This is **really important** stuff.\n"
        );
    });
});

describe("integration: lintText", () => {
    const linter = buildLinter();

    it("lints a clean markdown string with no errors", async () => {
        const text = [
            "# Title",
            "",
            "First sentence.",
            "Second sentence.",
            "",
            "Third sentence.",
        ].join("\n");

        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.be.empty;
    });

    it("reports multiple sentences on one line via lintText", async () => {
        const text = "First sentence. Second sentence.\n";
        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.have.lengthOf(1);
        expect(result.messages[0].message).to.match(
            /only one sentence per line/
        );
    });

    it("reports a sentence spanning lines via lintText", async () => {
        const text = "This is a sentence\nthat spans two lines.\n";
        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.have.lengthOf(1);
        expect(result.messages[0].message).to.match(
            /should not span multiple lines/
        );
    });

    it("handles a document with headings, lists, and paragraphs", async () => {
        const text = readFixture("valid-rich-markdown.md");
        const result = await linter.lintText(text, "rich.md");
        expect(result.messages).to.be.empty;
    });

    it("reports correct line numbers for errors deep in a document", async () => {
        const text = readFixture("invalid-complex-document.md");
        const result = await linter.lintText(text, "complex.md");

        const lines = text.split("\n");
        for (const msg of result.messages) {
            expect(msg.loc.start.line).to.be.greaterThan(0);
            expect(msg.loc.start.column).to.be.greaterThan(0);
            expect(msg.loc.start.line).to.be.at.most(lines.length);
        }
    });

    it("produces no errors for a document that is only headings", async () => {
        const text = "# Heading One\n\n## Heading Two\n\n### Heading Three\n";
        const result = await linter.lintText(text, "headings.md");
        expect(result.messages).to.be.empty;
    });

    it("produces no errors for a list-only document", async () => {
        const text = "- Item one\n- Item two\n- Item three\n";
        const result = await linter.lintText(text, "list.md");
        expect(result.messages).to.be.empty;
    });

    it("produces no errors for a blockquote with one sentence per line", async () => {
        const text = "> First quoted sentence.\n> Second quoted sentence.\n";
        const result = await linter.lintText(text, "quote.md");
        expect(result.messages).to.be.empty;
    });

    it("reports errors inside a blockquote with multiple sentences per line", async () => {
        const text = "> First sentence. Second sentence.\n";
        const result = await linter.lintText(text, "quote.md");
        expect(result.messages).to.have.lengthOf(1);
        expect(result.messages[0].message).to.match(
            /only one sentence per line/
        );
    });

    it("each error has ruleId set to idiomatic-lines", async () => {
        const text = "Hello world. Goodbye world.\n";
        const result = await linter.lintText(text, "test.md");
        for (const msg of result.messages) {
            expect(msg.ruleId).to.equal("idiomatic-lines");
        }
    });

    it("each error has a range with start < end", async () => {
        const text = "Hello world. Goodbye world.\n";
        const result = await linter.lintText(text, "test.md");
        for (const msg of result.messages) {
            expect(msg.range).to.exist;
            expect(msg.range[0]).to.be.lessThan(msg.range[1]);
        }
    });

    it("ignores fenced code blocks", async () => {
        const text = [
            "Some intro.",
            "",
            "```js",
            'console.log("Hello."); console.log("World.");',
            "if (x > 0) { return true. }",
            "```",
            "",
            "Some outro.",
        ].join("\n");

        const result = await linter.lintText(text, "fenced.md");
        expect(result.messages).to.be.empty;
    });

    it("ignores indented code blocks", async () => {
        const text = [
            "Some intro.",
            "",
            '    console.log("Hello."); console.log("World.");',
            "    if (x > 0) { return true. }",
            "",
            "Some outro.",
        ].join("\n");

        const result = await linter.lintText(text, "indented.md");
        expect(result.messages).to.be.empty;
    });

    it("handles inline code within a sentence", async () => {
        const text =
            "Use `obj.method()` to call it.\nThen check `result.value` next.\n";

        const result = await linter.lintText(text, "inline.md");
        expect(result.messages).to.be.empty;
    });

    it("produces no errors for a paragraph followed by image references", async () => {
        const text = [
            "Here is an example of a passing check:",
            "![Passing Check](./image/ci/passing-check.png)",
            "![Passing Check Code](./image/ci/passing-check-code.png)",
        ].join("\n");

        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.be.empty;
    });

    it("produces no errors for ordered list items containing code fences", async () => {
        const text = [
            "1.  Run",
            "    ```shell",
            "    cert-tool refresh -f",
            "    ```",
            "1.  If not already there, add the following to your `~/.gitconfig` (the paths to your `sslCert` and `sslKey` **must** be absolute for Git LFS):",
            "",
            "    **Mac**",
            "    ```",
            '    [http "https://git.example.com:7006"]',
            "        sslCert = /Users/<YOUR_USER_NAME>/.pki/certificates/user.crt",
            "        sslKey = /Users/<YOUR_USER_NAME>/.pki/certificates/user.key",
            "        sslVerify = true",
            "    ```",
            "    **Windows**",
            "    ```",
            '    [http "https://git.example.com:7006"]',
            "        sslCert = C:\\\\Users\\\\<YOUR_USER_NAME>\\\\.pki\\\\certificates\\\\user.crt",
            "        sslKey = C:\\\\Users\\\\<YOUR_USER_NAME>\\\\.pki\\\\certificates\\\\user.key",
            "        sslVerify = true",
            "    ```",
            "1. Retry the Git command that was failing",
        ].join("\n");

        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.be.empty;
    });

    it("produces no errors for a sentence ending with a colon followed by a label", async () => {
        const text = [
            "Additionally, the reverse proxy redirect will not work on port 7004.",
            "For example:",
        ].join("\n");

        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.be.empty;
    });

    it("produces no errors for a list item with bold label and indented paragraph", async () => {
        const text = [
            "* **Why?**",
            "",
            "    GitHub's approach to merging Pull Requests differs from Bitbucket's capabilities.",
            "    GHES branch protection rules require a specific, named status check to enable auto-merge, while BB requires a simple status check count to enable auto-merge.",
        ].join("\n");

        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.be.empty;
    });

    it("produces no errors for a list item with inline code, colon, and nested sub-list", async () => {
        const text = [
            "2. `ghe-migrator audit --guid <guid> [--model-names <model-names>] `:",
            "This step emits comma-separated values for each of the models specified, or all of them if empty.",
            "We invoke this step to act as the basis for modifying some of the values, such as:",
            "    * Collapsing all repos into 1 GH org (`corp`)",
            "    * Renaming the repo to prevent naming collisions (`$BB_PROJECT-$BB_REPO`)",
            "    * Creating users and teams in GHES (doing it here prevents a race condition if it is done during the `ghe-migrator import` step).",
            "",
            "    Typical model-names include: `user`,`organization`,`repository`,`team`",
        ].join("\n");

        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.be.empty;
    });

    it("produces no errors for sentences containing quoted text with periods", async () => {
        const text = [
            "Yes, the storage backend was moved to NFS on October 2, 2021.",
            'This date is significant because it provides a reference point for noting in the documentation that "Image attachments in PRs before X were not migrated."',
            "The alignment of this date with entries in the `bb_attachments` table helps to confirm the timeframe for the migration of image attachments.",
        ].join("\n");

        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.be.empty;
    });

    it("produces no errors for a list item with italic parenthetical and bold label across lines", async () => {
        const text = [
            "1. **You must use the [Git Proxy](../concepts/proxy.md) locally:** If you've [installed or updated the cert tool](https://docs.example.com/cert-tool/user-guide/) since December 2023, your local `~/.gitconfig` is already set up to use the proxy.",
            "  _(If you're unsure, simply remove the `~/.pki` directory and reinstall.)_",
            "  **Pro Tip:** If you haven't already, we suggest running `cert-tool enroll` to enroll your device to automatically and continuously get fresh credentials.",
        ].join("\n");

        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.be.empty;
    });

    it("produces no errors for a sentence ending with a markdown link containing a query string", async () => {
        const text =
            "If you have feedback, please reach out to us at [#engineering-help](https://chat.example.com/app_redirect?channel=engineering-help).";

        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.be.empty;
    });

    it("produces no errors for nested list items with abbreviations in parentheses", async () => {
        const text = [
            "### `identity`",
            "- <b>Purpose</b>: SSO sign-in",
            "  - Gets the extension's redirect URL for the OAuth flow",
            "  - Opens the auth provider (e.g. Okta) in a popup and returns the redirect URL with additional auth codes/params",
        ].join("\n");

        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.be.empty;
    });

    it("handles multiple paragraphs where only some are invalid", async () => {
        const text = [
            "This paragraph is fine.",
            "",
            "This one has two sentences. On the same line.",
            "",
            "This paragraph is also fine.",
            "It has two sentences on separate lines.",
        ].join("\n");

        const result = await linter.lintText(text, "test.md");
        expect(result.messages).to.have.lengthOf(1);
        expect(result.messages[0].loc.start.line).to.equal(3);
    });
});
