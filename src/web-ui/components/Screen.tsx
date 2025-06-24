import type { ComponentChildren } from 'preact';
import './screen.css';

export interface ScreenProps {
  children: ComponentChildren;
}

export const Screen = ({ children }: ScreenProps) => (
  <div className="screen">
    {children}
  </div>
); 