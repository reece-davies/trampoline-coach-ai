
import React from 'react';
import type { Message } from '../types';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import {marked} from 'marked';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  const createMarkup = (content: string) => {
    return { __html: marked(content, { gfm: true, breaks: true }) };
  };

  return (
    <div className={`flex items-start gap-4 my-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
          <BotIcon className="w-6 h-6" />
        </div>
      )}
      <div
        className={`max-w-md md:max-w-2xl px-4 py-3 rounded-2xl shadow-md ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-700 text-gray-200 rounded-bl-none'
        }`}
      >
        <div 
          className="prose prose-invert prose-sm md:prose-base max-w-none"
          dangerouslySetInnerHTML={createMarkup(message.content)} 
        />
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white">
          <UserIcon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
