import type { Metadata } from 'next';
import ColorPickerToolRefactored from './components/ColorPickerToolRefactored';

export const metadata: Metadata = {
  title: 'Color Picker',
  description: 'Pick colors and convert between HEX, RGB, HSL, and other formats.',
};

export default function ColorPickerPage() {
  return <ColorPickerToolRefactored />;
}
