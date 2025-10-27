export type TextCase = 
  | 'uppercase'
  | 'lowercase'
  | 'titleCase'
  | 'sentenceCase'
  | 'camelCase'
  | 'pascalCase'
  | 'snakeCase'
  | 'kebabCase'
  | 'constantCase'
  | 'dotCase'
  | 'pathCase'
  | 'alternatingCase'
  | 'inverseCase';

export const textCaseOptions: { value: TextCase; label: string; example: string }[] = [
  { value: 'uppercase', label: 'UPPERCASE', example: 'HELLO WORLD' },
  { value: 'lowercase', label: 'lowercase', example: 'hello world' },
  { value: 'titleCase', label: 'Title Case', example: 'Hello World' },
  { value: 'sentenceCase', label: 'Sentence case', example: 'Hello world' },
  { value: 'camelCase', label: 'camelCase', example: 'helloWorld' },
  { value: 'pascalCase', label: 'PascalCase', example: 'HelloWorld' },
  { value: 'snakeCase', label: 'snake_case', example: 'hello_world' },
  { value: 'kebabCase', label: 'kebab-case', example: 'hello-world' },
  { value: 'constantCase', label: 'CONSTANT_CASE', example: 'HELLO_WORLD' },
  { value: 'dotCase', label: 'dot.case', example: 'hello.world' },
  { value: 'pathCase', label: 'path/case', example: 'hello/world' },
  { value: 'alternatingCase', label: 'aLtErNaTiNg CaSe', example: 'hElLo WoRlD' },
  { value: 'inverseCase', label: 'Inverse Case', example: 'hELLO wORLD' },
];

export function convertTextCase(text: string, textCase: TextCase): string {
  switch (textCase) {
    case 'uppercase':
      return text.toUpperCase();
    
    case 'lowercase':
      return text.toLowerCase();
    
    case 'titleCase':
      return text.replace(
        /\w\S*/g,
        (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
      );
    
    case 'sentenceCase':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    
    case 'camelCase':
      return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .replace(/\s+/g, '')
        .replace(/[-_./]/g, '');
    
    case 'pascalCase':
      return text
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/[-_./]/g, '');
    
    case 'snakeCase':
      return text
        .replace(/\s+/g, '_')
        .replace(/[A-Z]/g, (match, index) => index > 0 ? `_${match.toLowerCase()}` : match.toLowerCase())
        .replace(/[-./]/g, '_')
        .replace(/_+/g, '_')
        .toLowerCase();
    
    case 'kebabCase':
      return text
        .replace(/\s+/g, '-')
        .replace(/[A-Z]/g, (match, index) => index > 0 ? `-${match.toLowerCase()}` : match.toLowerCase())
        .replace(/[_./]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
    
    case 'constantCase':
      return text
        .replace(/\s+/g, '_')
        .replace(/[A-Z]/g, (match, index) => index > 0 ? `_${match}` : match)
        .replace(/[-./]/g, '_')
        .replace(/_+/g, '_')
        .toUpperCase();
    
    case 'dotCase':
      return text
        .replace(/\s+/g, '.')
        .replace(/[A-Z]/g, (match, index) => index > 0 ? `.${match.toLowerCase()}` : match.toLowerCase())
        .replace(/[-_/]/g, '.')
        .replace(/\.+/g, '.')
        .toLowerCase();
    
    case 'pathCase':
      return text
        .replace(/\s+/g, '/')
        .replace(/[A-Z]/g, (match, index) => index > 0 ? `/${match.toLowerCase()}` : match.toLowerCase())
        .replace(/[-_.]/g, '/')
        .replace(/\/+/g, '/')
        .toLowerCase();
    
    case 'alternatingCase':
      return text
        .split('')
        .map((char, index) => index % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
        .join('');
    
    case 'inverseCase':
      return text
        .split('')
        .map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())
        .join('');
    
    default:
      return text;
  }
}