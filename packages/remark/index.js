export default function remark() {
  const plugins = [];
  return {
    use(plugin) {
      if (plugin) plugins.push(plugin);
      return this;
    },
    process(value) {
      return Promise.resolve({ value, data: { plugins } });
    },
  };
}
