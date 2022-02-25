const schedule = require("node-schedule");
const fs = require("fs/promises");
const { Configuration, OpenAIApi } = require("openai");
const { exec } = require("child_process");

// schedule a job to run every 5 seconds
const rule = new schedule.RecurrenceRule();
rule.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const job = schedule.scheduleJob(rule, async () => {
  try {
    // read key from ./key.txt
    const key = await fs.readFile("./key.txt", "utf8");

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
    await fs.writeFile("./readme.md", message);

    // commit the message
    await exec(`git add . && git commit -m "${message}" && git push`);

    console.log(`Successfully wrote commit message: ${message}`);
  } catch (error) {
    console.error(error);
  }
});
