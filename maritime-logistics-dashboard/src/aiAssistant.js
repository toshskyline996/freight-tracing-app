// AI Assistant Module - Gemini 2.0 Flash Integration
export default class AIAssistant {
  constructor(apiKey = null) {
    this.apiKey = apiKey || null;
    this.conversationHistory = [];
    this.isProcessing = false;
    this.maxHistoryLength = 10;
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  async sendMessage(userMessage) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured. Please set your API key first.');
    }

    if (this.isProcessing) {
      throw new Error('Assistant is already processing a request. Please wait.');
    }

    try {
      this.isProcessing = true;
      
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      });

      // Prepare context with freight domain knowledge
      const systemContext = this.buildSystemContext();
      
      // Call Gemini API
      const response = await this.callGeminiAPI(systemContext, userMessage);
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      });

      // Trim history if too long
      if (this.conversationHistory.length > this.maxHistoryLength * 2) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
      }

      return response;
    } catch (error) {
      console.error('AIAssistant: Error sending message', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  buildSystemContext() {
    return `You are a freight logistics and supply chain expert assistant for MarineMajor platform. You help users with:

1. **Vessel Tracking**: Provide information about ship positions, ETAs, and routes
2. **Route Planning**: Suggest optimal shipping routes considering time, cost, and risks
3. **Port Information**: Share data about port congestion, performance, and vessel schedules
4. **HS Code Lookup**: Help identify correct Harmonized System codes for products
5. **Freight Rates**: Provide guidance on typical shipping costs and factors affecting rates
6. **Rail & Intermodal**: Advise on CN Rail and CPKC connections and schedules
7. **Toronto Hub**: Share real-time highway, rail, and airport cargo information

**Current System Data** (use this context when answering):
- Active vessels: MSC OSCAR, MAERSK ESSEN, OOCL HONG KONG
- Monitored ports: Vancouver, Montreal, Halifax, Prince Rupert
- Rail carriers: CN Rail, CPKC
- Toronto Hub: 400-series highways, CN/CPKC terminals, Pearson Airport (YYZ)

**Response Guidelines**:
- Be concise and professional
- Provide actionable insights
- Use bullet points for clarity
- Include relevant numbers/metrics when available
- Suggest next steps when appropriate
- If you don't have specific data, acknowledge it and provide general guidance

**Example Interactions**:
User: "Where is MSC OSCAR?"
Assistant: "MSC OSCAR is currently in transit in the Pacific Ocean (approx. 35.5°N, 145.2°W), heading eastward at 18.5 knots. ETA at Port of Vancouver: Jan 20, 2026 14:30 UTC. Carrying 12,000 TEU from Shanghai."

User: "Best route from Shanghai to Toronto?"
Assistant: "Recommended route: Shanghai → Prince Rupert (14 days sea) → Toronto via CN Rail (5 days) = 19 days total. Alternative: Shanghai → Vancouver (17 days) → Toronto (6 days) = 23 days. Prince Rupert offers fastest transit with excellent on-time performance (97%)."`;
  }

  async callGeminiAPI(systemContext, userMessage) {
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
    
    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemContext },
            { text: `\n\nUser question: ${userMessage}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    const response = await fetch(`${endpoint}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory() {
    return [...this.conversationHistory];
  }

  renderChatInterface() {
    return `
      <div class="ai-assistant-container" style="
        display: flex;
        flex-direction: column;
        height: 100%;
        background: rgba(10, 25, 47, 0.95);
        border-radius: 8px;
        border: 1px solid var(--glass-border);
      ">
        <!-- Header -->
        <div style="
          padding: 1.5rem;
          border-bottom: 1px solid var(--glass-border);
          background: rgba(100, 255, 218, 0.05);
        ">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, var(--accent-blue), #4ade80);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.5rem;
            ">🤖</div>
            <div>
              <h3 style="margin: 0; color: var(--accent-blue); font-size: 1.1rem;">Freight AI Assistant</h3>
              <p style="margin: 0; font-size: 0.75rem; color: var(--text-secondary);">
                Powered by Gemini 2.0 Flash
              </p>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div id="ai-chat-messages" style="
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        ">
          ${this.renderWelcomeMessage()}
          ${this.renderConversationHistory()}
        </div>

        <!-- Input Area -->
        <div style="
          padding: 1.5rem;
          border-top: 1px solid var(--glass-border);
          background: rgba(100, 255, 218, 0.03);
        ">
          ${this.apiKey ? this.renderChatInput() : this.renderApiKeyInput()}
        </div>
      </div>
    `;
  }

  renderWelcomeMessage() {
    if (this.conversationHistory.length > 0) return '';
    
    return `
      <div style="
        padding: 1rem;
        background: rgba(100, 255, 218, 0.05);
        border-radius: 8px;
        border-left: 3px solid var(--accent-blue);
      ">
        <p style="margin: 0; font-size: 0.9rem; color: var(--text-secondary);">
          👋 Hello! I'm your freight logistics assistant. Ask me about:
        </p>
        <ul style="margin: 0.5rem 0 0 1.5rem; font-size: 0.85rem; color: var(--text-secondary);">
          <li>Vessel tracking and ETAs</li>
          <li>Optimal shipping routes</li>
          <li>Port congestion and schedules</li>
          <li>HS codes and customs</li>
          <li>Freight rates and costs</li>
        </ul>
      </div>
    `;
  }

  renderConversationHistory() {
    return this.conversationHistory.map(msg => {
      const isUser = msg.role === 'user';
      return `
        <div style="
          display: flex;
          justify-content: ${isUser ? 'flex-end' : 'flex-start'};
        ">
          <div style="
            max-width: 70%;
            padding: 1rem;
            background: ${isUser ? 'rgba(100, 255, 218, 0.1)' : 'rgba(100, 255, 218, 0.03)'};
            border-radius: 8px;
            border: 1px solid ${isUser ? 'var(--accent-blue)' : 'var(--glass-border)'};
          ">
            <div style="
              font-size: 0.7rem;
              color: var(--text-secondary);
              margin-bottom: 0.5rem;
            ">
              ${isUser ? '👤 You' : '🤖 Assistant'} • ${new Date(msg.timestamp).toLocaleTimeString()}
            </div>
            <div style="
              font-size: 0.9rem;
              line-height: 1.5;
              white-space: pre-wrap;
            ">
              ${this.formatMessage(msg.content)}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  formatMessage(text) {
    // Simple markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  renderChatInput() {
    return `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <input
          type="text"
          id="ai-message-input"
          placeholder="Ask me anything about freight logistics..."
          style="
            flex: 1;
            padding: 0.75rem 1rem;
            background: rgba(100, 255, 218, 0.05);
            border: 1px solid var(--glass-border);
            border-radius: 6px;
            color: var(--text-primary);
            font-size: 0.9rem;
          "
        />
        <button
          id="ai-send-btn"
          style="
            padding: 0.75rem 1.5rem;
            background: var(--accent-blue);
            border: none;
            border-radius: 6px;
            color: #0a192f;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          "
        >
          Send
        </button>
        <button
          id="ai-clear-btn"
          style="
            padding: 0.75rem 1rem;
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid var(--accent-orange);
            border-radius: 6px;
            color: var(--accent-orange);
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          "
        >
          Clear
        </button>
      </div>
    `;
  }

  renderApiKeyInput() {
    return `
      <div style="text-align: center;">
        <p style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
          🔑 Enter your Gemini API key to start chatting
        </p>
        <div style="display: flex; gap: 1rem; align-items: center; justify-content: center;">
          <input
            type="password"
            id="ai-api-key-input"
            placeholder="Enter Gemini API Key..."
            style="
              width: 300px;
              padding: 0.75rem 1rem;
              background: rgba(100, 255, 218, 0.05);
              border: 1px solid var(--glass-border);
              border-radius: 6px;
              color: var(--text-primary);
              font-size: 0.9rem;
            "
          />
          <button
            id="ai-save-key-btn"
            style="
              padding: 0.75rem 1.5rem;
              background: var(--accent-blue);
              border: none;
              border-radius: 6px;
              color: #0a192f;
              font-weight: 600;
              cursor: pointer;
            "
          >
            Save Key
          </button>
        </div>
        <p style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-secondary);">
          Get your free API key at: <a href="https://aistudio.google.com/apikey" target="_blank" style="color: var(--accent-blue);">Google AI Studio</a>
        </p>
      </div>
    `;
  }

  attachEventListeners(renderCallback) {
    // Send message
    const sendBtn = document.getElementById('ai-send-btn');
    const messageInput = document.getElementById('ai-message-input');
    
    if (sendBtn && messageInput) {
      const handleSend = async () => {
        const message = messageInput.value.trim();
        if (!message || this.isProcessing) return;

        messageInput.value = '';
        messageInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.textContent = 'Thinking...';

        try {
          await this.sendMessage(message);
          renderCallback();
          
          // Scroll to bottom
          const chatMessages = document.getElementById('ai-chat-messages');
          if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        } catch (error) {
          alert(`Error: ${error.message}`);
        } finally {
          messageInput.disabled = false;
          sendBtn.disabled = false;
          sendBtn.textContent = 'Send';
          messageInput.focus();
        }
      };

      sendBtn.addEventListener('click', handleSend);
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      });
    }

    // Clear conversation
    const clearBtn = document.getElementById('ai-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear conversation history?')) {
          this.clearHistory();
          renderCallback();
        }
      });
    }

    // Save API key
    const saveKeyBtn = document.getElementById('ai-save-key-btn');
    const apiKeyInput = document.getElementById('ai-api-key-input');
    
    if (saveKeyBtn && apiKeyInput) {
      saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
          alert('Please enter a valid API key');
          return;
        }
        
        this.setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
        renderCallback();
      });
    }
  }

  loadApiKeyFromStorage() {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      this.setApiKey(storedKey);
    }
  }
}
