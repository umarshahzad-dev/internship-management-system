import { Injectable, Logger } from '@nestjs/common';
import { IPdfCompiler } from '../../application/ports/pdf-compiler.port';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { DomainException } from '../../common/exceptions/domain.exception';

const execAsync = promisify(exec);

@Injectable()
export class TypstCompilerService implements IPdfCompiler {
  private readonly logger = new Logger(TypstCompilerService.name);

  async compile(templateName: string, data: any): Promise<Buffer> {
    const tempId = randomUUID();
    // Use the templates directory directly to satisfy Typst's security sandbox
    const tempDir = path.join(process.cwd(), 'templates');
    const dataPath = path.join(tempDir, `${tempId}.json`);
    const pdfPath = path.join(tempDir, `${tempId}.pdf`);

    try {
      // Ensure the templates directory exists
      await fs.mkdir(tempDir, { recursive: true });
      await fs.writeFile(dataPath, JSON.stringify(data), 'utf-8');

      // Execute Typst directly inside the templates directory using flat filenames
      const { stderr } = await execAsync(
        `typst compile ${templateName} ${tempId}.pdf --input data_file=${tempId}.json`,
        { cwd: tempDir },
      );

      if (stderr) {
        this.logger.warn(`Typst compilation warnings: ${stderr}`);
      }

      return await fs.readFile(pdfPath);
    } catch (error) {
      this.logger.error('Typst compilation failed', error);
      throw new DomainException(
        'COMPILATION_ERROR',
        'Failed to generate PDF document. Template may be missing or invalid.',
        500,
      );
    } finally {
      // Clean up the flat files
      await fs.rm(dataPath, { force: true }).catch(() => {});
      await fs.rm(pdfPath, { force: true }).catch(() => {});
    }
  }
}
