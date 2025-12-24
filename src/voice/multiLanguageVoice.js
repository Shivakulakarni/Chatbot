/**
 * Multi-Language Voice Support Manager
 * Handles language detection, translation, and voice configuration
 */
export class MultiLanguageVoice {
  constructor() {
    this.supportedLanguages = {
      'mr-IN': {
        name: 'मराठी',
        englishName: 'Marathi',
        nativeName: 'मराठी',
        locale: 'mr_IN',
        voiceId: 'mr-IN-Neural2-A'
      },
      'hi-IN': {
        name: 'हिंदी',
        englishName: 'Hindi',
        nativeName: 'हिंदी',
        locale: 'hi_IN',
        voiceId: 'hi-IN-Neural2-A'
      },
      'ta-IN': {
        name: 'தமிழ்',
        englishName: 'Tamil',
        nativeName: 'தமிழ்',
        locale: 'ta_IN',
        voiceId: 'ta-IN-Neural2-A'
      },
      'te-IN': {
        name: 'తెలుగు',
        englishName: 'Telugu',
        nativeName: 'తెలుగు',
        locale: 'te_IN',
        voiceId: 'te-IN-Neural2-A'
      },
      'bn-IN': {
        name: 'বাঙ্গালি',
        englishName: 'Bengali',
        nativeName: 'বাঙ্গালি',
        locale: 'bn_IN',
        voiceId: 'bn-IN-Neural2-A'
      },
      'od-IN': {
        name: 'ଓଡ଼ିଆ',
        englishName: 'Odia',
        nativeName: 'ଓଡ଼ିଆ',
        locale: 'od_IN',
        voiceId: 'od-IN-Neural2-A'
      }
    };

    this.currentLanguage = 'mr-IN'; // Default to Marathi
  }

  /**
   * Detect language from text
   */
  detectLanguage(text) {
    // Simple detection based on script
    const languageScripts = {
      'mr-IN': /[\u0900-\u097F]/g, // Devanagari
      'hi-IN': /[\u0900-\u097F]/g, // Devanagari
      'ta-IN': /[\u0B80-\u0BFF]/g, // Tamil
      'te-IN': /[\u0C00-\u0C7F]/g, // Telugu
      'bn-IN': /[\u0980-\u09FF]/g, // Bengali
      'od-IN': /[\u0B00-\u0B7F]/g  // Odia
    };

    for (const [lang, pattern] of Object.entries(languageScripts)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'mr-IN'; // Default to Marathi
  }

  /**
   * Set current language
   */
  setLanguage(languageCode) {
    if (this.supportedLanguages[languageCode]) {
      this.currentLanguage = languageCode;
      return {
        success: true,
        language: languageCode,
        name: this.supportedLanguages[languageCode].name
      };
    }
    return {
      success: false,
      error: `Language ${languageCode} not supported`
    };
  }

  /**
   * Get language configuration
   */
  getLanguageConfig(languageCode = this.currentLanguage) {
    return this.supportedLanguages[languageCode] || null;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return Object.entries(this.supportedLanguages).map(([code, config]) => ({
      code,
      ...config
    }));
  }

  /**
   * Format text for language
   */
  formatForLanguage(text, languageCode = this.currentLanguage) {
    // Language-specific formatting
    const formatRules = {
      'mr-IN': (t) => t, // No special formatting needed
      'hi-IN': (t) => t,
      'ta-IN': (t) => t,
      'te-IN': (t) => t,
      'bn-IN': (t) => t,
      'od-IN': (t) => t
    };

    const formatter = formatRules[languageCode] || ((t) => t);
    return formatter(text);
  }
}

export default MultiLanguageVoice;
