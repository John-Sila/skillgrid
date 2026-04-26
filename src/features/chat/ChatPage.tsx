import React from 'react';
import { ChatView } from './ChatView';
import { useParams } from 'react-router-dom';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  return <ChatView initialChatId={conversationId} />;
};
