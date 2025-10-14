import React from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
}

export const Skeleton = ({ 
  className = '', 
  width = '100%', 
  height = '1rem', 
  rounded = true 
}: SkeletonProps) => {
  return (
    <div
      className={`
        bg-gray-200 animate-pulse
        ${rounded ? 'rounded' : ''}
        ${className}
      `}
      style={{ width, height }}
    />
  )
}

interface MessageSkeletonProps {
  isUser?: boolean
}

export const MessageSkeleton = ({ isUser = false }: MessageSkeletonProps) => {
  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      
      <div className={`max-w-[72%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`
          px-4 py-3 rounded-xl shadow-sm bg-gray-200 animate-pulse
          ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}
        `}>
          <div className="space-y-2">
            <Skeleton width="80%" height="0.875rem" />
            <Skeleton width="60%" height="0.875rem" />
            {Math.random() > 0.5 && (
              <Skeleton width="40%" height="0.875rem" />
            )}
          </div>
        </div>
        <Skeleton width="3rem" height="0.75rem" className="mt-2" />
      </div>
    </div>
  )
}

interface ChatSkeletonProps {
  messageCount?: number
}

export const ChatSkeleton = ({ messageCount = 3 }: ChatSkeletonProps) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: messageCount }).map((_, index) => (
        <MessageSkeleton key={index} isUser={index % 2 === 0} />
      ))}
    </div>
  )
}
