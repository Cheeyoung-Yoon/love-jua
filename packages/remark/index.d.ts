export default function remark(): {
  use(plugin: unknown): ReturnType<typeof remark>;
  process(value: string): Promise<{ value: string; data: { plugins: unknown[] } }>;
};
