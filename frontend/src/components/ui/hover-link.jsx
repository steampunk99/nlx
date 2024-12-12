import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TextLoop } from './textloop';

export function HoverLink({ to, defaultText, className }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={to}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <TextLoop isHovered={isHovered} direction="up">
        {[defaultText, defaultText]}
      </TextLoop>
    </Link>
  );
}
