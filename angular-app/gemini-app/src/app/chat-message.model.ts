/**
 * Defines the structure for a single chat message in the NovaGem app.
 */
export interface Message {
  id: string; // Unique identifier for the message
  text: string; // The content of the message
  sender: 'user' | 'ai' | 'system'; // Differentiates who sent the message for styling and logic
  timestamp: Date; // When the message was sent
  avatarUrl?: string; // Optional URL for the sender's avatar

  // Properties specific to AI messages
  isThinking?: boolean; // True if this is a placeholder for a "thinking..." bubble
  showCopy?: boolean;
  showShare?: boolean;
  showFeedback?: boolean;
  showRegenerate?: boolean;

  // Optional property for rich content like code blocks
  codeBlock?: {
    language: string;
    code: string;
  };

  // Optional property for system messages (e.g., errors)
  isError?: boolean;
}
