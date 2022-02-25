const schedule = require("node-schedule");
const fs = require("fs/promises");
const { Configuration, OpenAIApi } = require("openai");
const { exec } = require("child_process");

// schedule a job to run every 3 hours
const rule = new schedule.RecurrenceRule();
rule.hour = [0, 3, 6, 9, 12, 15, 18, 21];

const job = schedule.scheduleJob(rule, async () => {
  try {
    // read key from ./key.txt
    const key = (await fs.readFile("./key.txt", "utf8")) || process.env.key;
    const token =
      (await fs.readFile("./token.txt", "utf8")) || process.env.token;

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
    await exec(
      `git add . && git commit -m "${message}" && git push https://${token}@github.com/BalliAsghar/showoffgitgraph.git`
    );

    console.log(`Successfully wrote commit message: ${message}`);
  } catch (error) {
    console.error(error);
  }
});
