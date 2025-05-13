import React, { createContext, useContext, useState, useCallback } from "react";
import { useEvent } from "react-use";
import { v4 as uuidv4 } from "uuid";

// Define the message types
export interface WebViewMessageIncoming<T = any> {
  destination: "creator" | "settings";
  messageType: string;
  messageId?: string;
  payload?: T;
}

export interface WebMessageOutgoing<T = any> {
  messageType: string;
  data: T;
  messageId: string;
}

// Create a type map interface for extending with specific message types
export interface MessageTypeMap {
  [messageType: string]: any;
}

// Define the context value type with generic type parameters
interface MessagingContextValue {
  // Simple untyped version
  sendMessage: <ResponseType = any>(
    messageType: string,
    payload?: any,
    waitForResponse?: boolean,
  ) => Promise<ResponseType | void>;

  // Type-safe version with explicit message type
  typedSend: <
    MessageType extends string,
    PayloadType = any,
    ResponseType = any,
  >(
    messageType: MessageType,
    payload?: PayloadType,
    waitForResponse?: boolean,
  ) => Promise<ResponseType | void>;

  // Simple untyped version
  registerListener: (
    messageType: string,
    callback: (message: WebMessageOutgoing) => void,
  ) => () => void;

  // Type-safe version with explicit message type
  typedRegister: <PayloadType = any>(
    messageType: string,
    callback: (message: WebMessageOutgoing<PayloadType>) => void,
  ) => () => void;

  unregisterListener: (
    messageType: string,
    callback: (message: WebMessageOutgoing) => void,
  ) => void;
}

// Create the context
const MessagingContext = createContext<MessagingContextValue | null>(null);

// Create a provider component
interface MessagingProviderProps {
  children: React.ReactNode;
  destination?: "creator" | "settings";
}

/**
 * The messaging provider context is used to handle the vscode webview <-> extension communication
 */
export const MessagingProvider: React.FC<MessagingProviderProps> = ({
  children,
  destination,
}) => {
  // Store for pending promises waiting for responses
  const [pendingResponses, setPendingResponses] = useState<
    Record<
      string,
      { resolve: (value: any) => void; reject: (reason?: any) => void }
    >
  >({});

  // Store for registered listeners
  const [listeners, setListeners] = useState<
    Record<string, ((message: WebMessageOutgoing) => void)[]>
  >({});

  // Basic send message implementation
  const sendMessage = useCallback(
    <ResponseType = any,>(
      messageType: string,
      payload: any = undefined,
      waitForResponse: boolean = false,
    ): Promise<ResponseType | void> => {
      const messageId = uuidv4();

      const message: WebViewMessageIncoming = {
        messageId,
        destination,
        messageType,
        payload,
      };

      // Post the message to VSCode
      window.vscode?.postMessage(message);

      // If we're waiting for a response, return a promise
      if (waitForResponse) {
        return new Promise<ResponseType>((resolve, reject) => {
          setPendingResponses((prev) => ({
            ...prev,
            [messageId]: { resolve, reject },
          }));

          // Set a timeout to reject the promise after 10 seconds
          setTimeout(() => {
            setPendingResponses((prev) => {
              if (prev[messageId]) {
                prev[messageId].reject(
                  new Error(`Message ${messageType} timed out`),
                );
                const updated = { ...prev };
                delete updated[messageId];
                return updated;
              }
              return prev;
            });
          }, 10000);
        });
      }

      return Promise.resolve();
    },
    [],
  );

  // Handle incoming messages
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const message: WebMessageOutgoing = event.data;

      if (message.messageType === "ping") {
        sendMessage("pong").catch((e) => console.error(e));
        return;
      }

      // If this message has an ID and is in pending responses, resolve the corresponding promise
      if (message.messageId && pendingResponses[message.messageId]) {
        const { resolve } = pendingResponses[message.messageId];
        resolve(message);

        // Remove this pending response
        setPendingResponses((prev) => {
          const updated = { ...prev };
          delete updated[message.messageId];
          return updated;
        });
      }
      // console.dir(`GOT MESSAGE: ${JSON.stringify(message)}`);
      // Trigger any registered listeners for this message type
      if (message.messageType && listeners[message.messageType]) {
        listeners[message.messageType].forEach((callback) => callback(message));
      }
    },
    [pendingResponses, listeners],
  );

  // Set up the message event listener
  useEvent("message", handleMessage);

  // Type-safe send implementation
  const typedSend = useCallback(
    <MessageType extends string, PayloadType = any, ResponseType = any>(
      messageType: MessageType,
      payload?: PayloadType,
      waitForResponse?: boolean,
    ): Promise<ResponseType | void> => {
      return sendMessage<ResponseType>(messageType, payload, waitForResponse);
    },
    [sendMessage],
  );

  // Basic register listener implementation
  const registerListener = useCallback(
    (messageType: string, callback: (message: WebMessageOutgoing) => void) => {
      setListeners((prev) => ({
        ...prev,
        [messageType]: [...(prev[messageType] || []), callback],
      }));

      // Return a function to unregister this specific listener
      return () => unregisterListener(messageType, callback);
    },
    [],
  );

  // Type-safe register implementation
  const typedRegister = useCallback(
    <MessageType extends string, PayloadType = any>(
      messageType: MessageType,
      callback: (message: WebMessageOutgoing<PayloadType>) => void,
    ) => {
      return registerListener(messageType, callback as any);
    },
    [registerListener],
  );

  // Unregister a listener
  const unregisterListener = useCallback(
    (messageType: string, callback: (message: WebMessageOutgoing) => void) => {
      setListeners((prev) => {
        if (!prev[messageType]) return prev;

        return {
          ...prev,
          [messageType]: prev[messageType].filter((cb) => cb !== callback),
        };
      });
    },
    [],
  );

  const contextValue: MessagingContextValue = {
    sendMessage,
    typedSend,
    registerListener,
    typedRegister,
    unregisterListener,
  };

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  );
};

// Basic messaging hook
export const useMessaging = () => {
  const context = useContext(MessagingContext);

  if (!context) {
    throw new Error("useMessaging must be used within a MessagingProvider");
  }

  return context;
};

// Type-safe messaging hook with type map
export function useTypedMessaging<
  OutgoingMessages extends MessageTypeMap = MessageTypeMap,
  IncomingMessages extends MessageTypeMap = MessageTypeMap,
>() {
  const { sendMessage, registerListener, unregisterListener } = useMessaging();

  // Type-safe send function that infers payload type from message type
  function send<K extends keyof OutgoingMessages & string>(
    messageType: K,
    payload?: OutgoingMessages[K],
    waitForResponse?: boolean,
  ): Promise<any> {
    return sendMessage(messageType, payload, waitForResponse);
  }

  // Type-safe register function that infers payload type from message type
  function register<K extends keyof IncomingMessages & string>(
    messageType: K,
    callback: (message: WebMessageOutgoing<IncomingMessages[K]>) => void,
  ) {
    return registerListener(messageType, callback as any);
  }

  return {
    send,
    register,
    unregister: unregisterListener,
  };
}
