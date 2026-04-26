import { memo } from 'react';

export const SystemGroupNode = memo(({ data }: any) => {
  const themeColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
  
  const isLocked = data.lockedby !== undefined
  const colorIndex = (data.label?.length || 0) % themeColors.length;
  const themeColor = themeColors[colorIndex];

  return (
    
    <div 
      className="w-full h-full border-2 rounded-2xl relative -z-10"
      style={{ 
        backgroundColor: `${themeColor}1a`, 
        borderColor: `${themeColor}40` 
      }}
    >
      {isLocked && (
        <div className="absolute -top-3 -right-3 flex items-center gap-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-50">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0110 0v4"></path>
          </svg>
          {data.lockedBy}
        </div>
      )}
      <div 
        className="absolute -top-3 left-6 px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase shadow-sm border"
        style={{ 
          backgroundColor: '#0f172a', 
          color: themeColor, 
          borderColor: `${themeColor}40` 
        }}
      >
        {data.label}
      </div>
    </div>
  );
});