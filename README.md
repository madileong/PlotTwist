# 📚 PlotTwist

**PlotTwist** is a web app that recommends movies and books using OpenAI's GPT API. Enter a search term (a book or movie title), and it’ll return a mix of titles in a fun JSON-based UI.

## 🔮 Features

- Get AI-generated movie and book recommendations
- Click to save media to your personal list
- Clear saved items at any time
- Responsive sidebar and clean UI
- Created using html, javascript, and css

## 🚀 How to Run the Project Locally

> ⚠️ You’ll need your own OpenAI API key to test the recommendation features.

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/plottwist.git
cd plottwist
```

### 2. Open the project

You can open `index.html` directly in your browser, or use Live Server in VS Code.

### 3. Add your OpenAI API key

Open the `script.js` file and find this line near the top:

```js
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";
```

Replace `"YOUR_OPENAI_API_KEY_HERE"` with your actual OpenAI API key.

> 🛡️ **Important:** Do not commit your key to any public repository. This placeholder is here to allow safe publishing.

### 4. You're ready to go!

- Search using the prompt bar
- Get instant AI-powered results
- Save media to your list
- Reset with the “Clear Saved” button

## 🧪 Testing Notes for Professor / Reviewers

To test the project:

- Email me at **[madison.leong@sjsu.edu]** to request a testable version with a working API key, or use your own key from [OpenAI’s dashboard](https://platform.openai.com/account/api-keys).
- This project uses the GPT-3.5-turbo `chat/completions` endpoint.
- JSON responses are parsed and displayed dynamically.

## 🛠 Technologies Used

- HTML, CSS, JavaScript
- OpenAI API (`gpt-3.5-turbo`)

## 📄 License

MIT — you’re free to use and modify. Just don’t publish with a real API key embedded 😅
