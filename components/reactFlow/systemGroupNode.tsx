import { memo } from 'react';

export const SystemGroupNode = memo(({ data }: any) => {
  const themeColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
  
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