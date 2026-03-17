try {
  const lucide = require('lucide-react');
  console.log('lucide-react is resolvable');
  const dateFns = require('date-fns');
  console.log('date-fns is resolvable');
} catch (e) {
  console.error('Module resolution failed:', e.message);
}
