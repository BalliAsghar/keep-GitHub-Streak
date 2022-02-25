import { execa } from "execa";
import { scheduleJob, RecurrenceRule } from "node-schedule";
import { Configuration, OpenAIApi } from "openai";
import fs from "fs/promises";

// schedule a job to run every 5 sconds
const rule = new RecurrenceRule();
rule.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

scheduleJob(rule, async () => {
  try {
    // read key from ./key.txt
    const key =
      process.env.key || "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";
    const token =
      process.env.token || "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";

    // openai api configuration
    const config = new Configuration({
      apiKey: key,
    });
    const api = new OpenAIApi(config);

    // get random git commit message
    const response = await api.createCompletion("text-curie-001", {
      prompt: "random commit message?",
    });

    // get the first result
    const message = response.data.choices[0].text.replace(/\n/g, "");

    // write the message to readme.md
    await fs.writeFile("./README.md", message);

    // add changes to git and push to github
    await execa("git", ["add", "."]);
    await execa("git", ["commit", "-m", message]);
    await execa("git", ["push", "origin", "main"]);

    console.log(`Successfully wrote commit message: ${message}`);
  } catch (error) {
    console.error(error);
  }
});
