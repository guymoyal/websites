'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

const StickyBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;
  const handleClose = () => setIsVisible(false);
  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:1000,background:'#fff',borderTop:'1px solid #e5e7eb',boxShadow:'0 -4px 12px rgba(0,0,0,0.1)',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',minHeight:'80px'}}>
      <div style={{position:'relative',maxWidth:'1200px',margin:'0 auto',padding:'8px 16px'}}>
        <button onClick={handleClose} style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.1)',border:'none',color:'#666',cursor:'pointer',padding:4,borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center',opacity:0.7,transition:'opacity 0.2s ease',zIndex:1001}} aria-label="Close banner"><X size={16} /></button>
        {/* Banner content removed */}
      </div>
    </div>
  );
};
export default StickyBanner;
