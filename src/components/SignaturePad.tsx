
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface SignaturePadProps {
  width?: number;
  height?: number;
  onSave: (signatureData: string) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ 
  width = 300, 
  height = 150, 
  onSave 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to be responsive
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    // Set actual size in memory
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Initial canvas setup
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add light gray border
    ctx.strokeStyle = '#cccccc';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
  }, []);
  
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    setHasSignature(true);
    
    // Get coordinates
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    ctx.beginPath();
    ctx.moveTo(
      clientX - rect.left,
      clientY - rect.top
    );
    
    // Prevent scrolling when drawing on mobile
    if ('touches' in e) {
      e.preventDefault();
    }
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    ctx.lineTo(
      clientX - rect.left,
      clientY - rect.top
    );
    ctx.stroke();
    
    // Prevent scrolling when drawing on mobile
    if ('touches' in e) {
      e.preventDefault();
    }
  };
  
  const endDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add light gray border
    ctx.strokeStyle = '#cccccc';
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#000000';
    
    setHasSignature(false);
  };
  
  const saveSignature = () => {
    if (!hasSignature) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        className="border border-gray-300 rounded-md mb-4 w-full"
        style={{ maxWidth: `${width}px`, height: `${height}px` }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="w-full h-full touch-none"
          style={{ touchAction: "none" }}
        />
      </div>
      <div className={`flex ${isMobile ? 'flex-col w-full' : 'flex-row'} gap-2`}>
        <Button 
          variant="outline" 
          onClick={clearSignature}
          className={`${isMobile ? 'w-full py-3' : ''} text-sm`}
        >
          Unterschrift löschen
        </Button>
        <Button 
          onClick={saveSignature}
          disabled={!hasSignature}
          className={`${isMobile ? 'w-full py-3' : ''} text-sm bg-[#B1904B] hover:bg-[#a07f42] text-white`}
        >
          Unterschrift bestätigen
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;
