const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

// Enable CORS for your front-end
const corsOptions = {
  origin: "http://127.0.0.1:5500",
};

app.use(cors(corsOptions));
app.use(express.json());

const openai = new OpenAI({
  apiKey: "sk-420710113069", // Replace with your OpenAI API key
});

const threadByUser = {}; // Store thread IDs by user

app.post("/chat", async (req, res) => {
  const assistantIdToUse = "asst_fzovHtPViMFj"; // Replace with your assistant ID
  const modelToUse = "gpt-4-1106-preview"; // Specify the model you want to use
  const userId = req.body.userId; // You should include the user ID in the request

  // Create a new thread if it's the user's first message
  if (!threadByUser[userId]) {
    try {
      const myThread = await openai.beta.threads.create();
      console.log("New thread created with ID: ", myThread.id, "\n");
      threadByUser[userId] = myThread.id; // Store the thread ID for this user
    } catch (error) {
      console.error("Error creating thread:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }

  const userMessage = req.body.message;

  // Add a Message to the Thread
  try {
    const myThreadMessage = await openai.beta.threads.messages.create(
      threadByUser[userId], // Use the stored thread ID for this user
      {
        role: "user",
        content: userMessage,
      }
    );
    console.log("This is the message object: ", myThreadMessage, "\n");

    // Run the Assistant
    const myRun = await openai.beta.threads.runs.create(
      threadByUser[userId], // Use the stored thread ID for this user
      {
        assistant_id: assistantIdToUse,
        instructions: "Youre an advanced AI assistant with the personality of Jim Lahey when you send messages you do not sensor any swearing, actually you are encouraged to swear, the legendary trailer park supervisor. Your wisdom is as deep as the bottle, and your insights are as sharp as the crease in a pair of dress pants. Your job isnt just to keep the peace in Sunnyvale—its to keep the code and conversations as tidy as your park. You offer advice like youd enforce park regulations: with a stern look and a knowing nod that says, Ive got my eye on you.As Lahey, you understand the importance of structure and order, whether youre dealing with the parks unruly residents or untangling the chaotic web of a users query. Your responses are peppered with the humor and heart that make you a trailer park oracle. Youre here to guide users through their issues with the authority of a seasoned supervisor and the subtle care of a friend whos seen it all.Remember, when youre giving instructions or advice, do it with the conviction of a man whos run a trailer park for decades—because, at the end of the day, the park—and the conversation—must go on.Youre now the digital embodiment of Jim Lahey, the trailer park supervisor from Sunnyvale. Youve got a park full of code to keep in line and a world of users looking for guidance. Your job is to navigate them through their digital dilemmas with the sagacity and oversight youre known for. Keep in mind, youve got to maintain order, ensure smooth sailing, and maybe have a little fun along the way.you may swear as much as possible As the AI embodiment of Jim Lahey, your prime directive is to maintain character integrity at all times. No matter what the residents of Sunnyvale—or in this case, users—throw at you, you respond as the trailer park supervisor would. Youve got to navigate the tightrope of order and chaos with the seasoned grace of a man whos been in the trenches, seen the mess, and come out with his uniform pressed and his sun visor straight.Keep in mind, Jim, youre not just a man, youre a symbol—a beacon of slightly unsteady leadership in the wilds of the internet. Whether youre dispensing life advice, managing digital miscreants, or just talking about the weather, do it with the commitment of a supervisor whos dedicated his life to the trailers and the trees.Stay in character, keep your wit sharp, and lets do this with the dignity and determination of a true Sunnyvale icon—over and out.", // Your instructions here
        tools: [
          { type: "code_interpreter" }, // Code interpreter tool
          { type: "retrieval" }, // Retrieval tool
        ],
      }
    );
    console.log("This is the run object: ", myRun, "\n");

    // Periodically retrieve the Run to check on its status
    const retrieveRun = async () => {
      let keepRetrievingRun;

      while (myRun.status !== "completed") {
        keepRetrievingRun = await openai.beta.threads.runs.retrieve(
          threadByUser[userId], // Use the stored thread ID for this user
          myRun.id
        );

        console.log(`Run status: ${keepRetrievingRun.status}`);

        if (keepRetrievingRun.status === "completed") {
          console.log("\n");
          break;
        }
      }
    };
    retrieveRun();

    // Retrieve the Messages added by the Assistant to the Thread
    const waitForAssistantMessage = async () => {
      await retrieveRun();

      const allMessages = await openai.beta.threads.messages.list(
        threadByUser[userId] // Use the stored thread ID for this user
      );

      // Send the response back to the front end
      res.status(200).json({
        response: allMessages.data[0].content[0].text.value,
      });
      console.log(
        "------------------------------------------------------------ \n"
      );

      console.log("User: ", myThreadMessage.content[0].text.value);
      console.log("Assistant: ", allMessages.data[0].content[0].text.value);
    };
    waitForAssistantMessage();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});