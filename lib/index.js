const chromium = require('chrome-aws-lambda')
const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher');

const defaultFlags = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--disk-cache-size=33554432',
  '--headless',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
]


if (['AWS_Lambda_nodejs10.x', 'AWS_Lambda_nodejs12.x'].includes(process.env.AWS_EXECUTION_ENV) === true) {
  if (process.env.FONTCONFIG_PATH === undefined) {
    process.env.FONTCONFIG_PATH = '/tmp/aws';

  }

  if (process.env.LD_LIBRARY_PATH === undefined) {
    process.env.LD_LIBRARY_PATH = '/tmp/aws/lib';
  } else if (process.env.LD_LIBRARY_PATH.startsWith('/tmp/aws/lib') !== true) {
    process.env.LD_LIBRARY_PATH = [...new Set(['/tmp/aws/lib', ...process.env.LD_LIBRARY_PATH.split(':')])].join(':');
  }
}


module.exports = async function createLighthouse(url, options = {}) {

  const log = options.logLevel ? require('lighthouse-logger') : null

  if (log)
    log.setLevel(options.logLevel)


  // Use Puppeteer to launch headful Chrome and don't use its default 800x600 viewport.
  /*
  const browser = await chromium.puppeteer.launch({
    args             : options.chromeFlags || defaultFlags,
    defaultViewport  : options.viewport    || chromium.defaultViewport,
    executablePath   : await chromium.executablePath,
    headless         : chromium.headless,
    ignoreHTTPSErrors: true,
  });*/

  const browser = await chromeLauncher.launch({
    port: 9222,
    chromePath: await chromium.executablePath,
    chromeFlags: defaultFlags
  });

  // Run lighthouse process
  const results = await lighthouse(url, {
    output  : 'json',
    logLevel: options.logLevel || 'info',
  });

  return {
    browser,
    log,
    results
  }
}
