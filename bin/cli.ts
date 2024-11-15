#!/usr/bin/env node

import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import readline from "readline";

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

async function fetchComponent(url: string): Promise<any> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  return response.json();
}

async function main() {
  if (process.argv.length < 3) {
    console.error("Please provide an ID as an argument");
    process.exit(1);
  }

  const id = process.argv[2];
  const baseUrl = "https://svgenie.vercel.app/api/component/";
  const url = baseUrl + id;

  try {
    const { id, source_code, component_code, component_name } =
      await fetchComponent(url);

    // create components directory if it doesn't exist
    const componentsDir = path.join(process.cwd(), "components");
    if (!fs.existsSync(componentsDir)) {
      fs.mkdirSync(componentsDir);
    }

    // prompt for filename
    const filename = await askQuestion(
      `Enter filename (without extension. Leave blank for ${component_name}): `
    );
    // use component_name as fallback
    const finalFilename = filename.trim() || component_name; 

    // write the component file
    const filePath = path.join(componentsDir, `${finalFilename}.tsx`);
    fs.writeFileSync(filePath, component_code);

    console.log(`Successfully imported component as ${finalFilename}.tsx`);
  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();
