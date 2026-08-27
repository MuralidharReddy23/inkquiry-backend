import { TextCleanerService } from './text-cleaner.service';

describe('TextCleanerService', () => {
  let service: TextCleanerService;

  beforeEach(() => {
    service = new TextCleanerService();
  });

  it('should join broken hyphenated words', () => {
    const input = 'This applica-\ntion has been approved.';

    const result = service.clean(input);

    expect(result).toBe('This application has been approved.');
  });

  it('should fix mid-sentence line breaks', () => {
    const input = `You must bring a valid
government-issued photo identification.`;

    const result = service.clean(input);

    expect(result).toBe(
      'You must bring a valid government-issued photo identification.',
    );
  });

  it('should normalize multiple spaces', () => {
    const input = 'You must bring   valid     identification.';

    const result = service.clean(input);

    expect(result).toBe('You must bring valid identification.');
  });

  it('should normalize Windows line endings', () => {
    const input = 'First line\r\nSecond line';

    const result = service.clean(input);

    expect(result).toBe('First line Second line');
  });

  it('should preserve paragraph boundaries', () => {
    const input = `First paragraph.

Second paragraph.`;

    const result = service.clean(input);

    expect(result).toBe(`First paragraph.

Second paragraph.`);
  });

  it('should remove excessive blank lines', () => {
    const input = `First paragraph.




Second paragraph.`;

    const result = service.clean(input);

    expect(result).toBe(`First paragraph.

Second paragraph.`);
  });

  it('should return an empty string for empty input', () => {
    expect(service.clean('')).toBe('');
  });
});
