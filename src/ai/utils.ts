export interface JsonCleanResult {
  success: boolean;
  data?: any;
  error?: string;
  original?: string;
}

export class JsonCleaner {
  static extractJson(text: string): JsonCleanResult {
    if (!text || typeof text !== 'string') {
      return {
        success: false,
        error: 'Invalid input: text must be a non-empty string',
        original: text
      };
    }

    const cleanedText = text.trim();
    
    const jsonPatterns = [
      /\{[\s\S]*\}/,
      /\[[\s\S]*\]/,
      /```json\s*([\s\S]*?)\s*```/,
      /```\s*([\s\S]*?)\s*```/
    ];

    for (const pattern of jsonPatterns) {
      const match = cleanedText.match(pattern);
      if (match) {
        const jsonStr = match[1] || match[0];
        const result = this.parseJson(jsonStr, cleanedText);
        if (result.success) {
          return result;
        }
      }
    }

    const bracketStart = cleanedText.indexOf('{');
    const bracketEnd = cleanedText.lastIndexOf('}');
    const arrayStart = cleanedText.indexOf('[');
    const arrayEnd = cleanedText.lastIndexOf(']');

    let jsonStr = '';
    
    if (bracketStart !== -1 && bracketEnd !== -1 && bracketEnd > bracketStart) {
      jsonStr = cleanedText.substring(bracketStart, bracketEnd + 1);
    } else if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
      jsonStr = cleanedText.substring(arrayStart, arrayEnd + 1);
    }

    if (jsonStr) {
      return this.parseJson(jsonStr, cleanedText);
    }

    const lines = cleanedText.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('{') || line.trim().startsWith('[')) {
        const result = this.parseJson(line.trim(), cleanedText);
        if (result.success) {
          return result;
        }
      }
    }

    return {
      success: false,
      error: 'No valid JSON found in the text',
      original: cleanedText
    };
  }

  private static parseJson(jsonStr: string, original: string): JsonCleanResult {
    try {
      const parsed = JSON.parse(jsonStr);
      return {
        success: true,
        data: parsed,
        original
      };
    } catch (error) {
      const fixedJson = this.attemptJsonFix(jsonStr);
      if (fixedJson) {
        try {
          const parsed = JSON.parse(fixedJson);
          return {
            success: true,
            data: parsed,
            original
          };
        } catch {
          return {
            success: false,
            error: `JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            original
          };
        }
      }

      return {
        success: false,
        error: `JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        original
      };
    }
  }

  private static attemptJsonFix(jsonStr: string): string | null {
    let fixed = jsonStr;

    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    fixed = fixed.replace(/(['"])?([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '"$2":');
    fixed = fixed.replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/g, ': "$1"');
    fixed = fixed.replace(/:\s*true/g, ': true');
    fixed = fixed.replace(/:\s*false/g, ': false');
    fixed = fixed.replace(/:\s*null/g, ': null');
    fixed = fixed.replace(/:\s*(\d+)/g, ': $1');

    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;

    if (openBraces > closeBraces) {
      fixed += '}'.repeat(openBraces - closeBraces);
    }
    if (openBrackets > closeBrackets) {
      fixed += ']'.repeat(openBrackets - closeBrackets);
    }

    try {
      JSON.parse(fixed);
      return fixed;
    } catch {
      return null;
    }
  }

  static safeJsonParse(text: string, fallback: any = null): any {
    const result = this.extractJson(text);
    return result.success ? result.data : fallback;
  }

  static validateJsonStructure(data: any, expectedStructure: any): boolean {
    if (typeof expectedStructure !== 'object' || expectedStructure === null) {
      return typeof data === typeof expectedStructure;
    }

    if (Array.isArray(expectedStructure)) {
      return Array.isArray(data);
    }

    for (const key in expectedStructure) {
      if (!(key in data)) {
        return false;
      }

      const expectedType = expectedStructure[key];
      const actualValue = data[key];

      if (typeof expectedType === 'object' && expectedType !== null) {
        if (!this.validateJsonStructure(actualValue, expectedType)) {
          return false;
        }
      } else if (typeof actualValue !== expectedType) {
        return false;
      }
    }

    return true;
  }
}

export default JsonCleaner;
