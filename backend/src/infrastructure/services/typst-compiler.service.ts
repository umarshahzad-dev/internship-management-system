import { Injectable, Logger } from '@nestjs/common';
import { IPdfCompiler } from '../../application/ports/pdf-compiler.port';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { DomainException } from '../../../common/exceptions/domain.exception';

const execAsync = promisify(exec);

@Injectable()
export class TypstCompilerService implements IPdfCompiler {
  private readonly logger = new Logger(TypstCompilerService.name);

  async compile(templateName: string, data: any): Promise<Buffer> {
    const tempId = randomUUID();
    const tempDir = path.join(process.cwd(), 'temp');
    const dataPath = path.join(tempDir, `${tempId}.json`);
    const pdfPath = path.join(tempDir, `${tempId}.pdf`);
    const templatePath = path.join(process.cwd(), 'templates', templateName);

    try {
      await fs.mkdir(tempDir, { recursive: true });
      await fs.writeFile(dataPath, JSON.stringify(data), 'utf-8');

      // Passes the JSON file path securely to Typst via sys.inputs
      const { stderr } = await execAsync(
        `typst compile ${templatePath} ${pdfPath} --input data_file=${dataPath}`,
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
      await fs.rm(dataPath, { force: true }).catch(() => {});
      await fs.rm(pdfPath, { force: true }).catch(() => {});
    }
  }
}
