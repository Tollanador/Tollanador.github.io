document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const form = document.getElementById('profileForm');
    const textInput = document.getElementById('textInput');
    const urlInput = document.getElementById('urlInput');
    const submitButton = document.getElementById('submitButton');
    const buttonText = submitButton.querySelector('.button-text');
    const loader = submitButton.querySelector('.loader');
    const outputSection = document.getElementById('outputSection');
    const output = document.getElementById('output');
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    const textInputContainer = document.getElementById('textInputContainer');
    const urlInputContainer = document.getElementById('urlInputContainer');
    const tabButtons = document.querySelectorAll('.tab-button');

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active tab
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Show/hide appropriate input
            const tabType = button.dataset.tab;
            if (tabType === 'text') {
                textInputContainer.classList.remove('hidden');
                urlInputContainer.classList.add('hidden');
            } else {
                textInputContainer.classList.add('hidden');
                urlInputContainer.classList.remove('hidden');
            }
        });
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get active input value
        const activeTab = document.querySelector('.tab-button.active').dataset.tab;
        const inputValue = activeTab === 'text' ? textInput.value : urlInput.value;

        if (!inputValue.trim()) {
            displayError('Please enter text or provide a valid URL.');
            return;
        }

        // Start loading state
        setLoading(true);

        try {
            // Create custom prompt
            const customPrompt = `Analyze this course profile content: ${inputValue}`;

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
            const htmlContent = extractHTML(openAIResponse);

            if (htmlContent) {
                displayOutput(htmlContent);
            } else {
                displayError('No HTML content found in the response.');
            }
        } catch (error) {
            displayError(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        submitButton.disabled = isLoading;
        loader.classList.toggle('hidden', !isLoading);
        buttonText.textContent = isLoading ? 'Processing Profile...' : 'Analyze Profile';
    }

    function displayOutput(content) {
        errorSection.classList.add('hidden');
        output.innerHTML = content;
        outputSection.classList.remove('hidden');
    }

    function displayError(message) {
        outputSection.classList.add('hidden');
        errorMessage.textContent = message;
        errorSection.classList.remove('hidden');
    }

    function extractHTML(text) {
        const htmlMatch = text.match(/<html.*?>[\s\S]*<\/html>/i);
        if (htmlMatch) {
            return htmlMatch[0];
        } else if (text.trim().startsWith('<')) {
            return text.trim();
        }
        return null;
    }
});
