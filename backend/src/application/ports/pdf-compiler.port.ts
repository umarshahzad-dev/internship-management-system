export abstract class IPdfCompiler {
  abstract compile(templateName: string, data: any): Promise<Buffer>;
}
