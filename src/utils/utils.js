// Utility functions for local storage
export const saveToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };
  
  export const getFromLocalStorage = (key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  };
  
// API calls
export const startConversation = async (step) => {
    const response = await fetch(`https://blufire-content-writer-server.replit.app/start?step=${step}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  };
  
  export const sendMessage = async (threadId, message, step) => {
    const response = await fetch(`https://blufire-content-writer-server.replit.app/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ thread_id: threadId, message, step })
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  };