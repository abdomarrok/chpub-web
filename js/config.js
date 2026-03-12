export const CONFIG = {
  agency: {
    name: "Ch.Pub — Agence Publicitaire",
    tagline: "Creative — Agence Publicitaire",
    address: "Kolea, Tipaza, Algérie",
    phone1: "05 50 800 183",
    phone2: "05 50 800 181",
    email: "ch.pub.algerie@gmail.com",
    hours: "Dim–Jeu 8h–17h",
    logo: 'Circular lowercase "b" letter mark',
    social: {
      tiktok: "https://www.tiktok.com/@ch_pub",
      facebook: "" // add when available
    }
  },

  alucobond: {
    types: {
      standard: { label: "Standard", price: 4000 },
      led: { label: "Rétroéclairé LED", price: 7000 },
      digital: { label: "Digital Premium", price: 10000 }
    },
    options: {
      installation: { label: "Installation incluse", rate: 0.15 },
      design: { label: "Conception graphique", fixed: 5000 }
    }
  },

  websites: {
    packages: {
      vitrine: { label: "Vitrine", price: 35000 },
      ecommerce: { label: "E-Commerce", price: 75000 },
      surMesure: { label: "Sur Mesure", price: null }
    },
    addons: {
      hebergement: { label: "Hébergement 1 an", price: 5000 },
      domaine: { label: "Nom de domaine", price: 2500 },
      maintenance: { label: "Maintenance annuelle", price: 12000 },
      contenu: { label: "Rédaction de contenu", price: 8000 }
    }
  },

  tva: 0.19
};
