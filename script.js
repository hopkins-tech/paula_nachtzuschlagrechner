const defaultConfig = {
    page_title: "Feiertagszuschlagsrechner",
    calculate_button: "Berechnen",
    reset_button: "Zurücksetzen",
    primary_color: "#006e80",
    secondary_color: "#008496",  

};

// SDK / Config
    async function onConfigChange(config) {
      const mainTitle = document.getElementById('main-title');
      const subtitle = document.getElementById('subtitle');
      const calculateBtn = document.getElementById('calculate-btn');
      const resetBtn = document.getElementById('reset-btn');

      mainTitle.textContent = config.main_title || defaultConfig.main_title;
      subtitle.textContent = config.subtitle || defaultConfig.subtitle;
      calculateBtn.textContent = config.calculate_button || defaultConfig.calculate_button;
      resetBtn.textContent = config.reset_button || defaultConfig.reset_button;

      const primaryColor = config.primary_color || defaultConfig.primary_color;
      const secondaryColor = config.secondary_color || defaultConfig.secondary_color;
      const backgroundColor = config.background_color || defaultConfig.background_color;
      const textColor = config.text_color || defaultConfig.text_color;
      const accentColor = config.accent_color || defaultConfig.accent_color;
      const fontFamily = config.font_family || defaultConfig.font_family;
      const fontSize = config.font_size || defaultConfig.font_size;

      document.querySelector('.widget-container').style.background = backgroundColor;
      mainTitle.style.color = textColor;
      mainTitle.style.fontFamily = `${fontFamily}, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      mainTitle.style.fontSize = `${fontSize * 2.25}px`;
      
      subtitle.style.fontFamily = `${fontFamily}, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      subtitle.style.fontSize = `${fontSize * 1.125}px`;

      const labels = document.querySelectorAll('.holiday-pay-calculator-widget .form-group label');
      labels.forEach(label => {
        label.style.fontFamily = `${fontFamily}, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        label.style.fontSize = `${fontSize}px`;
      });

      const inputs = document.querySelectorAll('.holiday-pay-calculator-widget .form-group input');
      inputs.forEach(input => {
        input.style.fontFamily = `${fontFamily}, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        input.style.fontSize = `${fontSize}px`;
      });

      calculateBtn.style.background = primaryColor;
      calculateBtn.style.fontFamily = `${fontFamily}, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      calculateBtn.style.fontSize = `${fontSize}px`;
      
      resetBtn.style.background = accentColor;
      resetBtn.style.fontFamily = `${fontFamily}, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      resetBtn.style.fontSize = `${fontSize}px`;

      document.querySelector('.final-result').style.background = primaryColor;
      document.querySelector('.final-result-amount').style.fontFamily = `${fontFamily}, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
      document.querySelector('.final-result-amount').style.fontSize = `${fontSize * 2.5}px`;


    }

    if (window.elementSdk) {
      window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities: (config) => ({
          recolorables: [
            {
              get: () => config.primary_color || defaultConfig.primary_color,
              set: (value) => {
                config.primary_color = value;
                window.elementSdk.setConfig({ primary_color: value });
              }
            },
            {
              get: () => config.secondary_color || defaultConfig.secondary_color,
              set: (value) => {
                config.secondary_color = value;
                window.elementSdk.setConfig({ secondary_color: value });
              }
            },
            {
              get: () => config.background_color || defaultConfig.background_color,
              set: (value) => {
                config.background_color = value;
                window.elementSdk.setConfig({ background_color: value });
              }
            },
            {
              get: () => config.text_color || defaultConfig.text_color,
              set: (value) => {
                config.text_color = value;
                window.elementSdk.setConfig({ text_color: value });
              }
            },
            {
              get: () => config.accent_color || defaultConfig.accent_color,
              set: (value) => {
                config.accent_color = value;
                window.elementSdk.setConfig({ accent_color: value });
              }
            }
          ],
          borderables: [],
          fontEditable: {
            get: () => config.font_family || defaultConfig.font_family,
            set: (value) => {
              config.font_family = value;
              window.elementSdk.setConfig({ font_family: value });
            }
          },
          fontSizeable: {
            get: () => config.font_size || defaultConfig.font_size,
            set: (value) => {
              config.font_size = value;
              window.elementSdk.setConfig({ font_size: value });
            }
          }
        }),
        mapToEditPanelValues: (config) => new Map([
          ["main_title", config.main_title || defaultConfig.main_title],
          ["subtitle", config.subtitle || defaultConfig.subtitle],
          ["calculate_button", config.calculate_button || defaultConfig.calculate_button],
          ["reset_button", config.reset_button || defaultConfig.reset_button]
        ])
      });
    }

    function formatCurrency(amount) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    }

    function formatPercentage(value) {
      return new Intl.NumberFormat('de-DE', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value / 100);
    }

    function showError(message) {
      const errorDiv = document.getElementById('error-message');
      errorDiv.textContent = message;
      errorDiv.classList.add('show');
      document.getElementById('result-section').classList.remove('show');
    }

    function hideError() {
      document.getElementById('error-message').classList.remove('show');
    }

    // Beispielwerte für Demonstration setzen
    document.addEventListener('DOMContentLoaded', function() {
      document.getElementById('hourly-wage').value = '15.00';
      document.getElementById('holiday-percentage').value = '40';
      document.getElementById('holiday-hours').value = '8';
      
      // Automatische Berechnung mit Beispielwerten
      setTimeout(() => {
        document.getElementById('calculator-form').dispatchEvent(new Event('submit'));
      }, 500);
    });

    document.getElementById('calculator-form').addEventListener('submit', function(e) {
      e.preventDefault();
      hideError();

      const hourlyWage = parseFloat(document.getElementById('hourly-wage').value);
      const holidayPercentage = parseFloat(document.getElementById('holiday-percentage').value);
      const holidayHours = parseFloat(document.getElementById('holiday-hours').value);

      if (hourlyWage <= 0 || holidayPercentage < 0 || holidayHours <= 0) {
        showError('Bitte geben Sie gültige positive Werte ein.');
        return;
      }

      // Berechnung nach der angegebenen Formel:
      // Brutto-Stundenlohn × Anzahl der Feiertagsarbeitsstunden × (100% + Prozentsatz Feiertagszuschlag)
      const bonusFactor = (100 + holidayPercentage) / 100;
      const totalWage = hourlyWage * holidayHours * bonusFactor;

      document.getElementById('final-amount').textContent = formatCurrency(totalWage);

      document.getElementById('result-section').classList.add('show');
    });

    document.getElementById('reset-btn').addEventListener('click', function() {
      document.getElementById('calculator-form').reset();
      document.getElementById('result-section').classList.remove('show');
      hideError();
    });
  </script>
