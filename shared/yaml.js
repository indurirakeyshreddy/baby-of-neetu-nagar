(function attachYamlParser() {
  function parseScalar(value) {
    const trimmed = value.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('"')) return JSON.parse(trimmed);
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (trimmed === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
    return trimmed;
  }

  function parseSimpleYaml(source) {
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const result = {};

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (!line.trim()) continue;

      const match = line.match(/^([A-Za-z][\w-]*):(?:\s*(.*))?$/);
      if (!match) throw new Error(`Unsupported YAML line: ${line}`);

      const [, key, rawValue = ''] = match;
      if (rawValue === '|-' || rawValue === '|') {
        const blockLines = [];
        index += 1;
        while (index < lines.length) {
          const blockLine = lines[index];
          if (blockLine === '') {
            blockLines.push('');
            index += 1;
            continue;
          }
          if (!blockLine.startsWith('  ')) break;
          blockLines.push(blockLine.slice(2));
          index += 1;
        }
        while (blockLines.at(-1) === '') blockLines.pop();
        result[key] = blockLines.join('\n');
        index -= 1;
        continue;
      }

      if (rawValue === '') {
        const items = [];
        index += 1;
        while (index < lines.length && lines[index].startsWith('  - ')) {
          items.push(parseScalar(lines[index].slice(4)));
          index += 1;
        }
        result[key] = items;
        index -= 1;
        continue;
      }

      result[key] = parseScalar(rawValue);
    }

    return result;
  }

  window.parseSimpleYaml = parseSimpleYaml;
})();