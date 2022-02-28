const schedule = require("node-schedule");
const fs = require("fs/promises");
const execa = require("execa");

// schedule a job to run every 10 minutes

schedule.scheduleJob("*/10 * * * *", async () => {
  try {
    // read key from ./key.txt

    // random text
    const message = `${Math.random()} - ${new Date()}`;

    // write the message to readme.md
    await fs.writeFile("./README.md", message);

    // commit the change
    await execa("git", ["add", "."]);
    await execa("git", ["commit", "-m", message]);
    await execa("git", ["push"]);

    console.log(
      `Successfully wrote commit message: ${message} to README.md at ${new Date()}`
    );
  } catch (error) {
    console.error(error);
  }
});
