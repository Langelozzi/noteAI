const { Configuration, OpenAIApi } = require("openai");
const { APIKEY } = require("../config.json");

const configuration = new Configuration({
    apiKey: APIKEY,
});
const openai = new OpenAIApi(configuration);

async function notemaker(article) {
    if (!configuration.apiKey) {
        return "OpenAI API key not configured, please follow instructions in README.md";
    }

    if (article.trim().length === 0) {
        return "Please enter a prompt";
    }

    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: generatePrompt(article),
            temperature: 1,
            max_tokens: 1000,
            top_p: 1.0,
            frequency_penalty: 0.0,
            presence_penalty: 1,
        });
        return completion.data.choices[0].text;
    } catch (error) {
        if (error.response) {
            console.error(error.response.status, error.response.data);
        } else {
            console.error(`Error with OpenAI API request: ${error.message}`);
        }
    }
}

// generatePrompt function that takes in a string that is being used as a prompt for the OpenAI API.
function generatePrompt(article) {
    return `Summarize the following article using bullet points. Focus on conciseness, only grab the most important information. Preface each section with a section header: ${article}`;
}

module.exports = { notemaker };
