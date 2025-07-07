import React, { useState, createContext } from 'react'; // createContext added for context API
import './Sidebar.css';
import { assets } from '../../assets/assets'; // Assuming assets include icons for the UI

// Create a Context for the chat functionality.
// This context will be used to share state and functions (like managing prompts, loading, answers)
// between the Sidebar and Main components, avoiding prop drilling.
export const ChatContext = createContext();

const Sidebar = () => {
  // State to control whether the sidebar is extended (open) or collapsed.
  const [extended, setExtended] = useState(false);

  // State to store an array of previous user prompts, enabling a chat history.
  const [prevPrompts, setPrevPrompts] = useState([]);

  // State to control the visibility of the chat result area in the Main component.
  // When false, the greeting/card suggestions are shown. When true, the chat conversation is shown.
  const [showResult, setShowResult] = useState(false);

  // State to hold the current text input by the user in the search box.
  const [input, setInput] = useState("");

  // State to store the most recently sent prompt. This is used for displaying the user's query
  // at the top of the chat result area.
  const [recentPrompt, setRecentPrompt] = useState("");

  // State to indicate if an API call is currently in progress (e.g., waiting for an AI response).
  // Used to display loading indicators.
  const [loading, setLoading] = useState(false);

  // State to store the AI's generated response. This will be displayed in the Main component.
  const [answer, setAnswer] = useState("");

  // This function is designed to be called when a user sends a prompt.
  // It updates the chat's state (history, loading, input field) and prepares for an AI response.
  // The actual API call will typically be handled in the Main component, which consumes this context.
  const onSent = async (prompt) => {
    setAnswer("");      // Clear any previous AI answer for the new query
    setLoading(true);   // Set loading to true while waiting for a response
    setShowResult(true); // Ensure the chat result area is displayed

    // If the current prompt is different from the most recent one, add it to the history.
    if (prompt !== recentPrompt) {
      setPrevPrompts(prev => [...prev, prompt]);
    }
    setRecentPrompt(prompt); // Update the recent prompt to the current one
    setInput("");           // Clear the input field after sending

    // NOTE: This `onSent` function in the Sidebar primarily manages the shared UI state.
    // The Main component, upon receiving this prompt via context, will then trigger its API call.
  };

  // Function to start a completely new chat session.
  // It resets all relevant chat states, clearing the conversation history from the UI.
  const newChat = () => {
    setLoading(false);      // Ensure loading state is off
    setShowResult(false);   // Hide the chat result area, show initial greeting/cards
    setAnswer("");          // Clear any displayed AI answer
    setInput("");           // Clear the input field
    setRecentPrompt("");    // Clear the most recent prompt
  };

  // The 'contextValue' object bundles all the states and functions
  // that need to be accessible by components consuming this context (e.g., Main.jsx).
  const contextValue = {
    prevPrompts,        // Array of all past prompts
    setPrevPrompts,     // Function to update the past prompts
    onSent,             // Function to handle sending a new prompt
    setRecentPrompt,    // Function to set the currently active prompt
    recentPrompt,       // The currently active prompt
    showResult,         // Boolean to control result area visibility
    setShowResult,      // Function to set result area visibility
    loading,            // Boolean for loading state
    setLoading,         // Function to set loading state
    input,              // Current value of the input box
    setInput,           // Function to set the input box value
    answer,             // AI's response
    setAnswer           // Function to set the AI's response
  };

  return (
    // ChatContext.Provider makes 'contextValue' accessible to all its children components.
    <ChatContext.Provider value={contextValue}>
      {/* The main sidebar container. Its class dynamically changes for responsiveness. */}
      <div className={`sidebar ${extended ? 'extended' : 'collapsed'}`}>
        <div className="top">
          {/* Menu icon to toggle the sidebar's extended/collapsed state. */}
          <img
            onClick={() => setExtended(prev => !prev)}
            className="menu"
            src={assets.menu_icon}
            alt="Menu Icon"
          />
          {/* Button to start a new chat, calling the newChat function. */}
          <div onClick={newChat} className="new-chat">
            <img src={assets.plus_icon} alt="Plus Icon" />
            {/* "New Chat" text is only visible when the sidebar is extended. */}
            {extended ? <p>New Chat</p> : null}
          </div>
        </div>

        {/* Recent chats section. Only visible if the sidebar is extended AND there are previous prompts. */}
        {extended && prevPrompts.length > 0 ? (
          <div className="recent">
            <p className="recent-title">Recent</p>
            {/* Map through 'prevPrompts' to display each recent chat entry. */}
            {prevPrompts.map((item, index) => (
              <div key={index} onClick={() => onSent(item)} className="recent-entry">
                <img src={assets.message_icon} alt="Message Icon" />
                {/* Display a truncated version of the prompt if it's too long. */}
                <p>{item.length > 18 ? item.slice(0, 15) + '...' : item}</p>
              </div>
            ))}
          </div>
        ) : null}

        {/* Bottom section of the sidebar containing help, activity, and settings options. */}
        <div className="bottom">
          <div className="bottom-item recent-entry">
            <img src={assets.question_icon} alt="Question Icon" />
            {extended ? <p>Help</p> : null} {/* Text visible only when extended */}
          </div>
          <div className="bottom-item recent-entry">
            <img src={assets.history_icon} alt="History Icon" />
            {extended ? <p>Activity</p> : null} {/* Text visible only when extended */}
          </div>
          <div className="bottom-item recent-entry">
            <img src={assets.setting_icon} alt="Setting Icon" />
            {extended ? <p>Settings</p> : null} {/* Text visible only when extended */}
          </div>
        </div>
      </div>
    </ChatContext.Provider>
  );
};

export default Sidebar;
