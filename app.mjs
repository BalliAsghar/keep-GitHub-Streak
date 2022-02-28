import { execa } from "execa";
import { scheduleJob } from "node-schedule";
import fs from "fs/promises";

console.log("Starting...");

// schedule a job to run every 10 minutes

scheduleJob("*/10 * * * *", async () => {
  try {
    // get the first result
    const message = `${Math.random()} - ${new Date().toLocaleString()}`;

    // write the message to readme.md
    await fs.writeFile("./README.md", message);

    // add changes to git and push to github
    await execa("git", ["add", "."]);
    await execa("git", ["commit", "-m", message]);
    await execa("git", ["push", "origin", "main"]);

    console.log(`${message} - ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error(error);
  }
});
