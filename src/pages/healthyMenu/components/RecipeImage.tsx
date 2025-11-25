import React from 'react';
import styles from './RecipeImage.module.css';

interface RecipeImageProps {
  emoji: string;
  gradient: string;
  size?: 'small' | 'medium' | 'large' | 'featured';
  className?: string;
}

const RecipeImage: React.FC<RecipeImageProps> = ({ 
  emoji, 
  gradient, 
  size = 'medium',
  className 
}) => {
  const sizeMap = {
    small: '40px',
    medium: '80px',
    large: '100px',
    featured: '120px'
  };

  return (
    <div 
      className={`${styles.imageContainer} ${className || ''}`}
      style={{ background: gradient }}
    >
      <span 
        className={styles.emoji}
        style={{ fontSize: sizeMap[size] }}
      >
        {emoji}
      </span>
    </div>
  );
};

export default RecipeImage;
