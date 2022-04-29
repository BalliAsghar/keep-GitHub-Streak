import { Octokit } from "@octokit/rest";
import fs from "fs/promises";
import schedule from "node-schedule";
import { execa } from "execa";

(async () => {
  const rule = new schedule.RecurrenceRule();
  rule.hour = 23;
  rule.minute = 58;

  schedule.scheduleJob(rule, async () => {
    console.log("Job Running...");

    // Init octokit client
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const me = await octokit.users.getAuthenticated();

    // get user commits
    const events = await octokit.activity.listEventsForAuthenticatedUser({
      username: me.data.login,
      per_page: 10,
      page: 1,
      type: "PushEvent",
      sort: "created",
    });

    if (events.data.length < 1) {
      console.log("No Events found");
      console.log("Job Done..");
      return;
    }

    console.log(events.data);

    const pushEvents = events.data.filter(
      (event) => event.type === "PushEvent"
    );

    if (pushEvents.length < 1) {
      console.log("No PushEvents found");
      console.log("Job Done...");
      return;
    }

    const eventCreatedAt = pushEvents.map((event) => event.created_at)[0];

    // convert to date
    const eventDate = new Date(eventCreatedAt);

    // compare now with event date
    const now = new Date();

    const diff = now.getTime() - eventDate.getTime();

    // if the difference is not more than 23 hours then do nothing
    if (diff < 1000 * 60 * 60 * 23) {
      console.log("No need to update");

      return;
    }

    await maintainStreak();
    console.log("Job Done...");
  });
})();

async function maintainStreak() {
  try {
    const message = `Streak maintained At: ${new Date().toLocaleString()}`;

    await fs.writeFile("./README.md", message);

    await execa("git", ["add", "."]);
    await execa("git", ["commit", "-m", message]);
    await execa("git", ["push", "-u", "origin", "main"]);

    console.log("Successfully Maintained Streak");
  } catch (error) {
    console.log(error);
  }
}
