# ChatCompare

ChatCompare is an application designed to compare multiple AI chatbot models side by side. The system includes token management, conversation interfaces with live API calls, model suggestions for testing performance, and a rating system.

## Live Demo
You can access a live version [here](https://matteobombelli.github.io/compare-chatbots/)

## Running Locally
To run and access locally:

1. Install npm on your machine by following the instructions [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Navigate to this directory on your machine
3. Run the command `cd app`
4. Run the command `npm install`
5. Run the command `npm run dev`
6. Navigate to [localhost:5173/](localhost:5173/)

## Features Implemented
1. **HomePage**
    - The homepage displays a vertical list of each available model for testing.
    - Each model shows an icon, name, token limit, and short description for the model to guide users to testing the correct models.

2. **Token Management**  
    - Each model has a token limit. When you send a message, tokens are deducted based on the word count of both the user's message and the model's response.
    - If a model does not have enough tokens to process your request, a yellow warning message appears: "You have run out of tokens! Please wait until more become available," and that model is disabled until its tokens refresh.

3. **Chat Interface**  
    - A chat window is provided for each active model.
    - You can type your own messages or click on pre-defined prompt suggestions.
    - A loading spinner shows when a model is processing a request.
    - Each model’s responses are displayed in its dedicated chat column.
    - A rating system allows you to rate each model's response from 1 to 5 stars.

4. **Prompt Suggestions**  
    - The system provides specific test prompts covering a range of subjects (e.g., science, history, literature) to help evaluate model performance.

5. **Session Summary**  
    - At any time, you can end the session to see a summary of ratings for each model.
    - Use the "Back to Home" button to start a new session.

## Step-by-Step Walkthrough

### 1. Selecting a Model
- On the homepage, **click on a model** (for example, **GPT-4o**) that shows available tokens.
  - If a model’s tokens are depleted, its button appears dim or disabled. Do not select those.

### 2. Sending Messages
- After selecting a model, you will be taken to the Chat Interface.
- **Header Controls**:
    - **Back**: Click to return to the homepage.
    - **End Session**: Click to finish the session and view a summary of model ratings.
- **Model Chat Window**:
    - The left column shows the selected model’s name, description, and token balance.
    - If tokens are low, the balance is displayed, and if depleted, a yellow message is shown.
- **Message Input**:
    - Type your message in the input box at the bottom.
    - Click **Send** or press Enter to submit your message.
    - Your message will deduct tokens (based on word count) from the model.
    - If the model does not have enough tokens, no API call is made, and a yellow warning appears.
- **Prompt Suggestions**:
    - Above the input area, you will see buttons with test prompts such as:
        - "Explain the theory of relativity in simple terms."
        - "Can you summarize the latest trends in artificial intelligence?"
        - "What's the capital of France and why is it significant?"
        - (and more…)
    - Click any suggestion to send that prompt as your message.

### 3. Rating Messages
- Next to each message, there is an outline of 5 stars
- Selecting a star will set your rating for the message, this can always be changed later
- Not all messages must be rated, and unrated messages will not affect the model's average rating

### 4. Adding Additional Chatbots
- Click the **+ Add Chatbot** button to open a popup with a list of models not currently active.
- Click on a model from the list to add it to your active chat columns.
- Each added model behaves the same: messages are sent simultaneously to all active models, and tokens are managed independently.

### 5. Ending the Session and Viewing Ratings
- When finished, click the **End Session** button.
- A summary is displayed showing the average rating for each model based on your feedback.
- Use the **Back to Home** button to return to the homepage and start a new session.

## Data Entry and Controls Summary

- **Message Input Box**: Enter your custom query.
- **Send Button / Enter Key**: Submit your message.
- **Prompt Suggestion Buttons**: Click these to automatically send a predefined test prompt.
- **+ Add Chatbot Button**: Add additional chatbot models to your conversation.
- **Rating Stars**: Click stars next to a model's response to rate its performance in that response (1-5).
- **Back Button**: Return to the homepage.
- **End Session Button**: Conclude the session and view the summary.
