const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Попытка загрузки страницы...');
  try {
    await page.goto('https://polis812.github.io/vacuu/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    const pageContent = await page.content();
    console.log('Содержимое страницы загружено:', pageContent.substring(0, 200));

    // Тест 1: Поле "Eigenes Pronomen"
    await page.waitForSelector('#pronomen', { timeout: 60000 });
    await page.selectOption('#pronomen', 'er/sie');
    const isEigenesVisible = await page.isVisible('#eigenesPronomen');
    console.log('Тест 1: Поле "Eigenes Pronomen" скрыто:', !isEigenesVisible ? '✓' : '✗');

    // Тест 2: Подпись не обрезается
    await page.fill('#vorname', 'Alexander Maximilian');
    await page.fill('#nachname', 'Alexander Maximilian');
    await page.click('button:has-text("Signatur Generieren")', { timeout: 60000 });
    const isOverflowing = await page.evaluate(() => {
      const el = document.querySelector('#signature-output');
      return el ? el.scrollWidth > el.clientWidth : true;
    });
    console.log('Тест 2: Подпись не обрезается:', !isOverflowing ? '✓' : '✗');

    // Тест 3: Адаптивность формы
    await page.setViewportSize({ width: 375, height: 667 });
    const formWidth = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form ? form.offsetWidth : 0;
    });
    console.log('Тест 3: Форма адаптируется (ширина <= 375):', formWidth <= 375 ? '✓' : '✗');

    // Тест 4: Нет смешанного содержимого
    const consoleMessages = [];
    page.on('console', msg => consoleMessages.push(msg.text()));
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    const mixedContent = consoleMessages.filter(msg => msg.includes('Mixed Content'));
    console.log('Тест 4: Нет смешанного содержимого:', mixedContent.length === 0 ? '✓' : '✗');
  } catch (error) {
    console.error('Ошибка:', error.message);
  }

  await browser.close();
})();
