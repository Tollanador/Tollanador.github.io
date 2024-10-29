document.getElementById('submitBtn').addEventListener('click', processInput);

async function processInput() {
    const userText = document.getElementById('userInput').value.trim();
    const userURL = document.getElementById('userURL').value.trim();
    const loader = document.getElementById('loader');
    const outputSection = document.getElementById('outputSection');
    const errorSection = document.getElementById('errorSection');
    const outputDiv = document.getElementById('output');
    const errorMessage = document.getElementById('errorMessage');

    // Reset sections
    outputSection.style.display = 'none';
    errorSection.style.display = 'none';
    outputDiv.innerHTML = '';
    errorMessage.innerText = '';

    let inputContent = '';

    // Validate input
    if (userText) {
        inputContent = userText;
    } else if (userURL) {
        inputContent = await extractTextFromURL(userURL);
        if (!inputContent) {
            displayError('Failed to extract text from the provided URL.');
            return;
        }
    } else {
        displayError('Please enter text or provide a valid URL.');
        return;
    }

    // Show loader
    loader.style.display = 'block';

    // Create custom prompt
    const customPrompt = `Your custom prompt with the user input inserted in the middle: ... ${inputContent} ...`;

    try {
        const response = await fetch('https://<your-worker-name>.workers.dev', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: customPrompt,
                max_tokens: 500,
            })
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        const openAIResponse = data.choices[0].text;

        // Extract HTML from the response
        const htmlContent = extractHTML(openAIResponse);

        // Hide loader
        loader.style.display = 'none';

        if (htmlContent) {
            outputDiv.innerHTML = htmlContent;
            outputSection.style.display = 'block';
        } else {
            displayError('No HTML content found in the response.');
        }

    } catch (error) {
        loader.style.display = 'none';
        displayError(`An error occurred: ${error.message}`);
    }
}

function extractHTML(text) {
    // Simple regex to extract HTML content
    const htmlMatch = text.match(/<html.*?>[\s\S]*<\/html>/i);
    if (htmlMatch) {
        return htmlMatch[0];
    } else {
        // Alternatively, return the whole text if it is HTML
        if (text.trim().startsWith('<')) {
            return text.trim();
        }
    }
    return null;
}

function displayError(message) {
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = message;
    errorSection.style.display = 'block';
}

async function extractTextFromURL(url) {
    // Placeholder function for URL text extraction
    // TODO: Implement text extraction logic here
    // For now, it returns null to simulate failure
    return null;
}
