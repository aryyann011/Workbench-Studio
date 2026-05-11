import { memo } from 'react';

export const SystemGroupNode = memo(({ data }: any) => {
  const themeColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
  
  const isLocked = data.lockedby !== undefined
  const colorIndex = (data.label?.length || 0) % themeColors.length;
  const themeColor = themeColors[colorIndex];

  return (
    
    <div 
      className="w-full h-full border-[3px] border-dashed rounded-3xl relative -z-10"
      style={{ 
        backgroundColor: `${themeColor}08`, 
        borderColor: `${themeColor}35`,
      }}
    >
      {/* Top accent line */}
      <div 
        className="absolute top-0 left-8 right-8 h-[3px] rounded-b-full"
        style={{ backgroundColor: `${themeColor}50` }}
      />

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
        className="absolute -top-4 left-8 flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold tracking-wider uppercase shadow-lg border-2"
        style={{ 
          backgroundColor: '#0f172a', 
          color: themeColor, 
          borderColor: `${themeColor}50`,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: themeColor }}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        {data.label}
      </div>

      {/* Bottom subtle label */}
      <div 
        className="absolute -bottom-3 right-8 px-3 py-0.5 rounded-md text-[10px] font-semibold tracking-widest uppercase"
        style={{ 
          backgroundColor: '#0f172a', 
          color: `${themeColor}80`,
          border: `1px solid ${themeColor}25`,
        }}
      >
        Phase
      </div>
    </div>
  );
});