import React from 'react';

interface PhaserBlockProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper semântico para elementos UI que bloqueiam input do Phaser.
 * O bloqueio real é gerenciado globalmente em App.tsx via listener
 * de pointerover + pointerdown/pointerup com stopPropagation.
 */
export const PhaserBlock: React.FC<PhaserBlockProps> = ({ children, className = '' }) => {
  return <div className={className}>{children}</div>;
};
