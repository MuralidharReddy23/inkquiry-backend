import { Injectable } from '@nestjs/common';

@Injectable()
export class TextCleanerService {
  clean(text: string): string {
    if (!text) return '';

    return this.trimText(
      this.collapseBlankLines(
        this.collapseSpaces(
          this.cleanLinePadding(
            this.joinWrappedLines(
              this.joinHyphenatedWords(this.normalizeLineEndings(text)),
            ),
          ),
        ),
      ),
    );
  }

  private normalizeLineEndings(text: string): string {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  private joinHyphenatedWords(text: string): string {
    return text.replace(/([A-Za-z])-\n([A-Za-z])/g, '$1$2');
  }

  private joinWrappedLines(text: string): string {
    return text.replace(/(?<![.!?:;\n])\n(?!\n)/g, ' ');
  }

  private cleanLinePadding(text: string): string {
    return text.replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n');
  }

  private collapseSpaces(text: string): string {
    return text.replace(/[ \t]{2,}/g, ' ');
  }

  private collapseBlankLines(text: string): string {
    return text.replace(/\n{3,}/g, '\n\n');
  }

  private trimText(text: string): string {
    return text.trim();
  }
}
