const chat_body = document.querySelector(".chat-body");
const msg_input = document.querySelector(".msg-input");
const file_input = document.querySelector("#file-input");
// const API_KEY= "AIzaSyDwiCY6PVelbEOqvn9bEp3-j4HmHq4LNZI"
// const API_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDwiCY6PVelbEOqvn9bEp3-j4HmHq4LNZI`;

const toggleBtn = document.getElementById('chat-bot-toggler');
const body = document.body;
const chatHistory=[]
toggleBtn.addEventListener('click', () => {
    body.classList.toggle('chatbot-visible');
});

// General message element creator
const createMessageElement = (content, classes) => {
    const div = document.createElement("div");
    div.classList.add(classes); 
    div.innerHTML = content;
    return div;
};
const userData = {
    message: "How does AI work?",
    file:{
        data: null,
        mime_type: null

    }
};

const generateBotResponse = async () => {
    chatHistory.push({
        role: "user",
        parts: [
            {
                text: userData.message 
            }, ...(userData.file.data ? [{
               inline_data: userData.file,
            }] : [])
        ]
    })

    const requestoptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: chatHistory
        })
    };

    try {
        const response = await fetch(API_URL, requestoptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error.message);
        }

        const botResponse = data.candidates[0]?.content?.parts[0]?.text.trim() || "No response";
        console.log("Bot says:", botResponse);
        chatHistory.push({
            role: "model",
            parts: [
                {text: botResponse}
                ]
        })

        displayBotMessage(botResponse);

        // 🔁 Reset image after response is used
        userData.file = { data: null, mime_type: null };

    } catch (err) {
        console.log(err);
    }
};

const displayBotMessage = (text) => {
    const div = document.createElement("div");
    div.classList.add("bot-msg");
    div.innerHTML = `
         <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-robot" viewBox="0 0 16 16">
                    <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
                    <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
                  </svg>
        <div class="msg-text">${text}</div>
    `;
    chat_body.appendChild(div);
    scrollToBottom();
};


// Append user's message
const handleOutgoingMsg = (usermsg) => {
    const msgcontent = `<div class="msg-text">${usermsg}</div>
    ${userData.file.data ? `<div class="file-preview"><img src="data:${userData.file.mime_type};base64,${userData.file.data}" alt="File preview" /></div>` : ""}`;
    const outgoing = createMessageElement(msgcontent, "user-msg");
    chat_body.appendChild(outgoing);
    scrollToBottom(); // Scroll to the bottom

   
};

// Append bot's message
// ❌ REMOVE or COMMENT OUT this whole function — it's not needed
const handleIncomingMsg = () => {
    const botHTML = `
        <div class="bot-msg"> <br>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-robot" viewBox="0 0 16 16">
                <!-- SVG paths here -->
            </svg>
            <div class="msg-text">
               <div class="thinkining-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
               </div>
            </div>
    `;

    const incoming = createMessageElement(botHTML, "bot-msg");
    chat_body.appendChild(incoming);
};

const scrollToBottom = () => {
    chat_body.scrollTo({
        top: chat_body.scrollHeight,
        behavior: "smooth"
    });
};





// Trigger on Enter key
msg_input.addEventListener("keydown", (e) => {
    const usermsg = e.target.value.trim();
    if (e.key === "Enter" && usermsg) {
        handleOutgoingMsg(usermsg); // Display user's message
        userData.message = usermsg; // Save actual input
        generateBotResponse();      // Trigger Gemini response
        e.target.value = "";        // Clear input
    }
});

file_input.addEventListener("change", () => {
    const file = file_input.files[0];
    if(!file) return;
    console.log("File selected:", file);

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64string = e.target.result.split(",")[1]; // Extract base64 string


        userData.file={
            data: base64string,
            mime_type: file.type
    
        }
        file_input.value = ""; // Clear the file input after reading
    };
    reader.readAsDataURL(file); 

});

document.querySelector("#file-upload").addEventListener("click", () => file_input.click());
