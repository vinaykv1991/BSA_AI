// Defines the structure for a chat message

export interface Message {
  type: 'user' | 'ai';    // Who sent the message
  text: string;           // The main text content
  timestamp: Date;        // When the message was sent/received
  code?: string;          // Optional raw code string for highlighting
  formattedText?: string; // Optional pre-processed text for HTML rendering (e.g., bold, italics)
  isError?: boolean;      // Optional flag to indicate an error message from AI/system
  // Future additions:
  // id?: string; // Unique ID for each message
  // status?: 'sending' | 'sent' | 'failed' | 'read'; // For user messages
  // feedback?: 'good' | 'bad'; // For AI messages
  // attachments?: any[]; // For file attachments
}
