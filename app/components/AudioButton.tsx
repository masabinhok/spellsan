"use client";
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface AudioButtonProps {
  word: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'minimal';
  className?: string;
  children?: React.ReactNode;
}

const AudioButton = ({
  word,
  size = 'md',
  variant = 'primary',
  className = '',
  children
}: AudioButtonProps) => {
  const { playWord, isPlayingWord } = useAudioPlayer();

  const isPlaying = isPlayingWord(word);

  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  };

  const variantClasses = {
    primary: `bg-blue-600 hover:bg-blue-700 text-white ${isPlaying ? 'bg-blue-700 animate-pulse' : ''}`,
    secondary: `bg-slate-100 hover:bg-slate-200 text-slate-600 ${isPlaying ? 'bg-slate-200 animate-pulse' : ''}`,
    minimal: `hover:bg-slate-100 text-slate-500 hover:text-slate-700 ${isPlaying ? 'bg-slate-100 text-blue-600 animate-pulse' : ''}`
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaying) {
      return; // Already playing, ignore clicks
    }

    await playWord(word);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPlaying}
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        rounded-lg flex items-center justify-center transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        ${isPlaying ? 'cursor-wait' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
      title={isPlaying ? `Playing "${word}"...` : `Listen to pronunciation of "${word}"`}
      aria-label={isPlaying ? `Playing pronunciation of ${word}` : `Play pronunciation of ${word}`}
    >
      {children || (
        <svg
          className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          {isPlaying ? (
            // Pause icon when playing
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          ) : (
            // Play icon when not playing
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          )}
        </svg>
      )}
    </button>
  );
};

export default AudioButton;
