#!/usr/bin/env mode
import * as yargs from "yargs";
import * as prompts from "prompts";
import * as path from "path";
import * as fs from "fs";
import * as fse from "fs-extra";
import { exec } from "child_process";
import { basic } from "./appReturns";

const tempDirName = "advancedCRATemplate";
const additionalOpts = [
  { title: "coming soon", value: "1" },
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

const executeCmd = async (cmd, showOutput = true) => {
  await new Promise((resolve) => exec(cmd, function (error, stdout) {
    if (showOutput)
      console.log("stdout", stdout);

    if (error !== null) {
      console.log("exec error", error);
    }

    resolve();
  }));
}

const copyTemplate = async () => {
  const templateDir = path.join(__dirname, "..", "craTemplate");
  const target = path.join(process.cwd(), tempDirName);
  return fse.copy(templateDir, target);
}

const additionals = async (args) => {
  let knownVariables = {
    AppReturn: JSON.stringify(basic.appReturn)
  };
  const appPath = path.join(process.cwd(), `${tempDirName}/template/src/App.tsx`);
  const app = await fs.promises.readFile(appPath, { encoding: "utf-8" });

  // If no additional functionality is selected
  // if (args.additionals.length === 0) {
  //   knownVariables = {
  //     AppReturn: JSON.stringify(basic.appReturn)
  //   }
  // }

  let appStringify = JSON.stringify(app);
  appStringify = appStringify.replace(/\{\{([^}]*)\}\}/g, (r, i) => {
    if (knownVariables.hasOwnProperty(i)) {
      return knownVariables[i].slice(1, -1);
    } else {
      console.warn(`Warning: Variable ${i} is not a known variable.`);
      return "";
    }
  });
  await fs.promises.writeFile(appPath, JSON.parse(appStringify));
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

  console.log("Copying template");
  await copyTemplate();

  try {
    await additionals(resolvedArgs);
    
    console.log("Installing template and dependencies");
    const templatePath = path.join(process.cwd(), tempDirName);
    await executeCmd(`npx create-react-app ${resolvedArgs.name} --template file:${templatePath}`);
  } catch(e) {}
  
  executeCmd(`rmdir /s /Q ${tempDirName}`, false);
}
