#!/usr/bin/env mode
import * as yargs from "yargs";
import * as prompts from "prompts";
import { exec } from "child_process";

const additionalOpts = [
  { title: "TestOpt1", value: "1" },
  { title: "TestOpt2", value: "2" },
  { title: "TestOpt3", value: "3" },
  { title: "TestOpt4", value: "4" },
  { title: "TestOpt5", value: "5" },
];

const handleCancel = () => {
  process.exit(0);
}

const resolveArgs = async (args) => {
  if (!args.name) {
    const { name } = await prompts.prompt(
      {
        type: "text",
        name: "name",
        message: "Enter a name for your app",
      },
      {
        onCancel: handleCancel,
      }
    );
    args.name = name;
  }

  if (!args.additionals) {
    const { additionals } = await prompts.prompt(
      {
        type: "multiselect",
        name: "additionals",
        message: "Which additional functional would you like to have?",
        instructions: false,
        choices: additionalOpts,
        hint: "- Space to select. Return to submit",
      },
      {
        onCancel: handleCancel,
      }
    );
    args.additionals = additionals;
  }

  return args;
}

const executeCmd = (cmd) => {
  exec(cmd, function (error, stdout) {
    console.log("stdout", stdout);

    if (error !== null) {
      console.log("exec error", error);
    }
  });
}

export const main = async () => {
  const rawArgs = yargs
    .strict()
    .scriptName("advanced-cra")
    .help("h")
    .usage("Initializes your cra with additional out of the box functionality")
    .example([["npx advanced-cra"]])
    .options({
      name: {
        desc: "App name",
        type: "string",
        alias: ["n"],
      },
      additionals: {
        desc: "Additional to add",
        type: "string",
        choices: additionalOpts.map((opt) => opt.value),
        alias: ["a"],
      },
    });

  const resolvedArgs = await resolveArgs(rawArgs);

  executeCmd(`npx create-react-app ${resolvedArgs.name} --template file:../advancedcra/craTemplate`);
}
