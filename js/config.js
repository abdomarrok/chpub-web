/**
 * config.js — SINGLE SOURCE OF TRUTH
 * No ES module export. Loaded as a plain script before all other JS.
 * All other scripts access CONFIG via the global scope.
 * 
 * @typedef {Object} CONFIG
 * @property {Object} agency - Agency contact and branding info
 * @property {Object} alucobond - Alucobond panel pricing and options
 * @property {Object} websites - Website package pricing and addons
 * @property {number} tva - TVA tax rate (19%)
 */

const CONFIG = {
  agency: {
    name: "Ch.Pub — Agence Publicitaire",
    tagline: "Creative — Agence Publicitaire",
    address: "Kolea, Tipaza, Algérie",
    phone1: "05 50 800 183",
    phone2: "05 50 800 182",
    phone1_wa: "213550800183",
    email: "ch.pub.algerie@gmail.com",
    hours: "Dim–Jeu 8h–17h",
    logo: 'Circular lowercase "b" letter mark',
    social: {
      tiktok: "https://www.tiktok.com/@ch_pub",
      facebook: "https://www.facebook.com/CH.PUB.ALGERIE/" ,
      instagram: "https://www.instagram.com/ch.pub/"
    }
  },

  alucobond: {
    types: {
      standard: { label: "Standard",           price: 4000  },
      led:      { label: "Rétroéclairé LED",    price: 7000  },
      digital:  { label: "Digital Premium",     price: 10000 }
    },
    options: {
      installation: { label: "Installation incluse",  rate: 0.15   },
      design:       { label: "Conception graphique",  fixed: 5000  }
    }
  },

  websites: {
    packages: {
      vitrine:   { label: "Vitrine",    price: 35000 },
      ecommerce: { label: "E-Commerce", price: 75000 },
      surMesure: { label: "Sur Mesure", price: null  }
    },
    addons: {
      hebergement: { label: "Hébergement 1 an",    price: 5000  },
      domaine:     { label: "Nom de domaine",       price: 2500  },
      maintenance: { label: "Maintenance annuelle", price: 12000 },
      contenu:     { label: "Rédaction de contenu", price: 8000  }
    }
  },

  tva: 0.19
};

/**
 * Validate CONFIG object on initialization
 * Ensures all prices are positive and required fields exist
 */
(function validateConfig() {
  const validatePrice = (val, path) => {
    if (typeof val !== 'number' || val < 0 || !isFinite(val)) {
      console.error(`Invalid price at ${path}: ${val}`);
      return false;
    }
    return true;
  };

  Object.entries(CONFIG.alucobond.types).forEach(([key, data]) => {
    if (!validatePrice(data.price, `alucobond.types.${key}`)) throw new Error(`Invalid Alucobond price`);
  });

  if (!validatePrice(CONFIG.alucobond.options.installation.rate, 'alucobond.options.installation.rate') ||
      !validatePrice(CONFIG.alucobond.options.design.fixed, 'alucobond.options.design.fixed')) {
    throw new Error('Invalid Alucobond option prices');
  }

  Object.entries(CONFIG.websites.packages).forEach(([key, data]) => {
    if (data.price !== null && !validatePrice(data.price, `websites.packages.${key}`)) {
      throw new Error(`Invalid website package price`);
    }
  });

  Object.entries(CONFIG.websites.addons).forEach(([key, data]) => {
    if (!validatePrice(data.price, `websites.addons.${key}`)) throw new Error('Invalid addon price');
  });

  if (!validatePrice(CONFIG.tva, 'tva')) throw new Error('Invalid TVA');

  console.log('✓ CONFIG validation passed');
})();

Object.freeze(CONFIG);
