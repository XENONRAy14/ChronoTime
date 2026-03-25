// Production-safe logger: suppresses debug/info logs in production
const Logger = (function() {
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  return {
    log: isProduction ? function() {} : console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    info: isProduction ? function() {} : console.info.bind(console)
  };
})();

// In production, silence verbose console.log calls (keep warn/error)
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  console.log = function() {};
}
