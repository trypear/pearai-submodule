import { useEffect } from 'react';
import { useMessaging, WebMessageOutgoing } from '../../../util/messagingContext';

interface ThemeColors {
  background: string;
  foreground: string;
  buttonBackground: string;
  buttonForeground: string;
  buttonHoverBackground: string;
  linkForeground: string;
  linkActiveForeground: string;
  errorForeground: string;
  focusBorder: string;
  widgetBackground: string;
  widgetForeground: string;
  descriptionForeground: string;
  textPreformatForeground: string;
  textSeparatorForeground: string;
  textBlockQuoteForeground: string;
  textMutedForeground: string;
  textCodeBlockForeground: string;
}

interface ThemeColorsMessage extends WebMessageOutgoing<ThemeColors> {
  messageType: 'themeColors';
}

export const ColorManager = () => {
  const { registerListener } = useMessaging();

  useEffect(() => {
    // Register listener for theme color updates using the messaging context
    return registerListener('themeColors', (message: ThemeColorsMessage) => {
        const colors = message.data;
        console.dir("COLOURS: ");
        console.dir(colors);
        // Set theme colors as CSS variables
        const root = document.documentElement;
        Object.entries(colors).forEach(([key, value]) => {
          if (value) {
            root.style.setProperty(`--${key}`, value);
          }
        });
      });
  }, [registerListener]);

  // This component doesn't render anything visible
  return null;
};

export default ColorManager;