import {
  useEffect,
} from "react";

import {
  useTheme,
} from "../../contexts/ThemeContext";
import {
  applyVisualPreferences,
  readPreferencesCache,
  settingsService,
} from "../../services/settingsService";


export function PreferencesBootstrap() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const cached =
      readPreferencesCache();

    if (cached) {
      setTheme(cached.theme);
      applyVisualPreferences(
        cached,
      );
    }

    let isMounted = true;

    settingsService
      .getPreferences()
      .then((preferences) => {
        if (!isMounted) {
          return;
        }

        setTheme(
          preferences.theme,
        );
        applyVisualPreferences(
          preferences,
        );
      })
      .catch(() => {
        // O cache/local continua válido
        // mesmo se a sincronização falhar.
      });

    return () => {
      isMounted = false;
    };
  }, [setTheme]);

  return null;
}
