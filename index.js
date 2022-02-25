const schedule = require("node-schedule");
const fs = require("fs/promises");
const { Configuration, OpenAIApi } = require("openai");
const { exec } = require("child_process");

// schedule a job to run every 5 sconds
const rule = new schedule.RecurrenceRule();
rule.second = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const job = schedule.scheduleJob(rule, async () => {
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

    // commit the message
    await exec(
      `echo "${message}" | git commit -a -m "${message}" && git push https://${token}@github.com/BalliAsghar/showoffgitgraph.git`
    );

    console.log(`Successfully wrote commit message: ${message}`);
  } catch (error) {
    console.error(error);
  }
});
