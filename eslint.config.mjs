import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
    {
        files: ["src/**/*.ts", "test/**/*.ts"],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                project: "./tsconfig.eslint.json",
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
        },
        rules: {
            "@typescript-eslint/no-deprecated": "error",
        },
    },
];
