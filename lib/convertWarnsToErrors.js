export default function convertWarnsToErrors(ruleset) {
  const rulesetProcessed = {};
  for (const [key, value] of Object.entries(ruleset)) {
    const processedValue = Array.isArray(value) ? [...value] : [value];
    if (processedValue[0] === 'warn' || processedValue[0] === 1) {
      processedValue[0] = 'error';
    }
    rulesetProcessed[key] = processedValue;
  }
  return rulesetProcessed;
}
