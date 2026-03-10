import { describe, it, expect } from 'vitest';
import { generateUrl } from './urlGenerator';

describe('generateUrl', () => {
  const baseUrl = 'https://example.com/can-i-use-gpu';

  it('should build a correct URL with time and url params', () => {
    const targetUrl = 'https://myapp.com';
    const time = 10;
    
    const result = generateUrl(targetUrl, time, baseUrl);
    
    expect(result).toBe('https://example.com/can-i-use-gpu?url=https%3A%2F%2Fmyapp.com&t=10');
  });

  it('should return empty string if no url is provided', () => {
    const targetUrl = '';
    const time = 5;
    
    const result = generateUrl(targetUrl, time, baseUrl);
    
    expect(result).toBe('');
  });

  it('should properly encode complex URLs', () => {
    const targetUrl = 'https://myapp.com/path?param1=value1&param2=value2';
    const time = 5;
    
    const result = generateUrl(targetUrl, time, baseUrl);
    
    expect(result).toBe('https://example.com/can-i-use-gpu?url=https%3A%2F%2Fmyapp.com%2Fpath%3Fparam1%3Dvalue1%26param2%3Dvalue2&t=5');
  });
});
