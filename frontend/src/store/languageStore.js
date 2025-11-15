import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Traductions complètes pour toutes les pages
const translations = {
  en: {
    // Navigation
    home: 'Home',
    products: 'Products',
    categories: 'Categories',
    guides: 'Guides',
    contact: 'Contact',
    
    // Interface
    search: 'Search...',
    cart: 'Cart',
    
    // Page d'accueil
    title: 'ZeroDay Shop',
    subtitle: 'Premium Digital Tools for Ethical Hackers',
    browseProducts: 'Browse Products',
    terminalCommand: 'root@zeroday:~#',
    featuredTools: 'Featured Tools',
    osintTools: 'OSINT Tools',
    osintDesc: 'Professional reconnaissance tools for intelligence gathering',
    webPentest: 'Web Pentest Kit',
    webPentestDesc: 'Comprehensive web application testing tools',
    cryptoTools: 'Crypto Analysis',
    cryptoDesc: 'Advanced cryptographic analysis utilities',
    pentestKits: 'Pentest Kits',
    pentestDesc: 'Complete penetration testing suites and frameworks',
    digitalGuides: 'Digital Guides',
    guidesDesc: 'Expert security documentation and cheat sheets',
    
    // Contact Page
    contactTitle: 'Contact',
    contactSubtitle: 'Need help? Questions about our products? Feel free to contact us!',
    telegram: 'Telegram',
    email: 'Secure Email',
    telegramDesc: 'Contact us directly on Telegram for quick support',
    emailDesc: 'Send us a secure email via ProtonMail',
    faqTitle: 'Frequently Asked Questions',
    techSupport: 'Technical Support',
    techSupportDesc: 'Download issues, account access, bugs',
    payments: 'Payments',
    paymentsDesc: 'Transaction questions, refunds',
    productsInfo: 'Products',
    productsInfoDesc: 'Information about our tools, training, guides',
    partnerships: 'Partnerships',
    partnershipsDesc: 'Collaborations, suggestions, proposals',
    securityNotice: 'Encrypted communications • Guaranteed confidentiality • 24/7 support',
    
    // Categories Page
    categoriesTitle: 'Categories',
    categoriesSubtitle: 'Explore our specialized product categories',
    toolsCategory: 'Tools',
    toolsCategoryDesc: 'Professional hacking and security tools',
    formationCategory: 'Training',
    formationCategoryDesc: 'Video courses and tutorials',
    databaseCategory: 'Databases',
    databaseCategoryDesc: 'Security databases and wordlists',
    comptesCategory: 'Accounts',
    comptesCategoryDesc: 'Premium service accounts',
    
    // Admin
    adminPanel: 'Admin Panel',
    secureAccess: 'Secure access to ZeroDay Shop administration',
    
    // Theme
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    toggleTheme: 'Toggle Theme',
    
    // Footer & Legal
    allRightsReserved: 'All rights reserved',
    unauthorizedUse: 'Unauthorized use of these tools may violate local, state, and federal laws.',
    legalNotice: 'For authorized security testing only'
  },
  
  fr: {
    // Navigation
    home: 'Accueil',
    products: 'Produits',
    categories: 'Catégories',
    guides: 'Guides',
    contact: 'Contact',
    
    // Interface
    search: 'Rechercher...',
    cart: 'Panier',
    
    // Page d'accueil
    title: 'ZeroDay Shop',
    subtitle: 'Outils Numériques Premium pour Hackers Éthiques',
    browseProducts: 'Parcourir les Produits',
    terminalCommand: 'root@zeroday:~#',
    featuredTools: 'Outils Vedettes',
    osintTools: 'Outils OSINT',
    osintDesc: 'Outils de reconnaissance professionnels pour la collecte de renseignements',
    webPentest: 'Kit Pentest Web',
    webPentestDesc: 'Outils complets de test d\'applications web',
    cryptoTools: 'Analyse Crypto',
    cryptoDesc: 'Utilitaires d\'analyse cryptographique avancés',
    pentestKits: 'Kits Pentest',
    pentestDesc: 'Suites complètes de tests de pénétration et frameworks',
    digitalGuides: 'Guides Numériques',
    guidesDesc: 'Documentation de sécurité experte et aide-mémoire',
    
    // Contact Page
    contactTitle: 'Contact',
    contactSubtitle: 'Besoin d\'aide ? Questions sur nos produits ? N\'hésitez pas à nous contacter !',
    telegram: 'Telegram',
    email: 'Email Sécurisé',
    telegramDesc: 'Contactez-nous directement sur Telegram pour un support rapide',
    emailDesc: 'Envoyez-nous un email sécurisé via ProtonMail',
    faqTitle: 'Questions Fréquentes',
    techSupport: 'Support Technique',
    techSupportDesc: 'Problèmes de téléchargement, accès aux comptes, bugs',
    payments: 'Paiements',
    paymentsDesc: 'Questions sur les transactions, remboursements',
    productsInfo: 'Produits',
    productsInfoDesc: 'Informations sur nos outils, formations, guides',
    partnerships: 'Partenariats',
    partnershipsDesc: 'Collaborations, suggestions, propositions',
    securityNotice: 'Communications chiffrées • Confidentialité garantie • Support 24/7',
    
    // Categories Page
    categoriesTitle: 'Catégories',
    categoriesSubtitle: 'Explorez nos catégories de produits spécialisés',
    toolsCategory: 'Outils',
    toolsCategoryDesc: 'Outils professionnels de hacking et sécurité',
    formationCategory: 'Formation',
    formationCategoryDesc: 'Cours vidéo et tutoriels',
    databaseCategory: 'Bases de Données',
    databaseCategoryDesc: 'Bases de données de sécurité et listes de mots',
    comptesCategory: 'Comptes',
    comptesCategoryDesc: 'Comptes de services premium',
    
    // Admin
    adminPanel: 'Panneau Admin',
    secureAccess: 'Accès sécurisé à l\'administration ZeroDay Shop',
    
    // Theme
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    toggleTheme: 'Changer de Thème',
    
    // Footer & Legal
    allRightsReserved: 'Tous droits réservés',
    unauthorizedUse: 'L\'utilisation non autorisée de ces outils peut violer les lois locales, nationales et fédérales.',
    legalNotice: 'Pour tests de sécurité autorisés uniquement'
  },
  
  es: {
    // Navigation
    home: 'Inicio',
    products: 'Productos',
    categories: 'Categorías',
    guides: 'Guías',
    contact: 'Contacto',
    
    // Interface
    search: 'Buscar...',
    cart: 'Carrito',
    
    // Page d'accueil
    title: 'ZeroDay Shop',
    subtitle: 'Herramientas Digitales Premium para Hackers Éticos',
    browseProducts: 'Explorar Productos',
    terminalCommand: 'root@zeroday:~#',
    featuredTools: 'Herramientas Destacadas',
    osintTools: 'Herramientas OSINT',
    osintDesc: 'Herramientas de reconocimiento profesionales para recopilación de inteligencia',
    webPentest: 'Kit Pentest Web',
    webPentestDesc: 'Herramientas completas de prueba de aplicaciones web',
    cryptoTools: 'Análisis Crypto',
    cryptoDesc: 'Utilidades avanzadas de análisis criptográfico',
    pentestKits: 'Kits Pentest',
    pentestDesc: 'Suites completas de pruebas de penetración y frameworks',
    digitalGuides: 'Guías Digitales',
    guidesDesc: 'Documentación experta de seguridad y hojas de trucos',
    
    // Contact Page
    contactTitle: 'Contacto',
    contactSubtitle: '¿Necesitas ayuda? ¿Preguntas sobre nuestros productos? ¡No dudes en contactarnos!',
    telegram: 'Telegram',
    email: 'Email Seguro',
    telegramDesc: 'Contáctanos directamente en Telegram para soporte rápido',
    emailDesc: 'Envíanos un email seguro vía ProtonMail',
    faqTitle: 'Preguntas Frecuentes',
    techSupport: 'Soporte Técnico',
    techSupportDesc: 'Problemas de descarga, acceso a cuentas, errores',
    payments: 'Pagos',
    paymentsDesc: 'Preguntas sobre transacciones, reembolsos',
    productsInfo: 'Productos',
    productsInfoDesc: 'Información sobre nuestras herramientas, cursos, guías',
    partnerships: 'Colaboraciones',
    partnershipsDesc: 'Colaboraciones, sugerencias, propuestas',
    securityNotice: 'Comunicaciones cifradas • Confidencialidad garantizada • Soporte 24/7',
    
    // Categories Page
    categoriesTitle: 'Categorías',
    categoriesSubtitle: 'Explora nuestras categorías especializadas de productos',
    toolsCategory: 'Herramientas',
    toolsCategoryDesc: 'Herramientas profesionales de hacking y seguridad',
    formationCategory: 'Formación',
    formationCategoryDesc: 'Cursos en video y tutoriales',
    databaseCategory: 'Bases de Datos',
    databaseCategoryDesc: 'Bases de datos de seguridad y listas de palabras',
    comptesCategory: 'Cuentas',
    comptesCategoryDesc: 'Cuentas de servicios premium',
    
    // Admin
    adminPanel: 'Panel Admin',
    secureAccess: 'Acceso seguro a la administración de ZeroDay Shop',
    
    // Footer & Legal
    allRightsReserved: 'Todos los derechos reservados',
    unauthorizedUse: 'El uso no autorizado de estas herramientas puede violar las leyes locales, estatales y federales.',
    legalNotice: 'Solo para pruebas de seguridad autorizadas'
  },
  
  ru: {
    // Navigation
    home: 'Главная',
    products: 'Продукты',
    categories: 'Категории',
    guides: 'Руководства',
    contact: 'Контакты',
    
    // Interface
    search: 'Поиск...',
    cart: 'Корзина',
    
    // Page d'accueil
    title: 'ZeroDay Shop',
    subtitle: 'Премиум Цифровые Инструменты для Этичных Хакеров',
    browseProducts: 'Просмотр Продуктов',
    terminalCommand: 'root@zeroday:~#',
    featuredTools: 'Рекомендуемые Инструменты',
    osintTools: 'OSINT Инструменты',
    osintDesc: 'Профессиональные инструменты разведки для сбора информации',
    webPentest: 'Web Pentest Набор',
    webPentestDesc: 'Комплексные инструменты тестирования веб-приложений',
    cryptoTools: 'Крипто Анализ',
    cryptoDesc: 'Продвинутые утилиты криптографического анализа',
    pentestKits: 'Наборы Пентестов',
    pentestDesc: 'Полные наборы для тестирования на проникновение и фреймворки',
    digitalGuides: 'Цифровые Руководства',
    guidesDesc: 'Экспертная документация по безопасности и шпаргалки',
    
    // Contact Page
    contactTitle: 'Контакты',
    contactSubtitle: 'Нужна помощь? Вопросы о наших продуктах? Свяжитесь с нами!',
    telegram: 'Телеграм',
    email: 'Безопасная Почта',
    telegramDesc: 'Свяжитесь с нами напрямую в Telegram для быстрой поддержки',
    emailDesc: 'Отправьте нам безопасное письмо через ProtonMail',
    faqTitle: 'Часто Задаваемые Вопросы',
    techSupport: 'Техническая Поддержка',
    techSupportDesc: 'Проблемы с загрузкой, доступ к аккаунтам, ошибки',
    payments: 'Платежи',
    paymentsDesc: 'Вопросы о транзакциях, возвраты',
    productsInfo: 'Продукты',
    productsInfoDesc: 'Информация о наших инструментах, обучении, руководствах',
    partnerships: 'Партнёрство',
    partnershipsDesc: 'Сотрудничество, предложения, партнёрство',
    securityNotice: 'Зашифрованная связь • Гарантированная конфиденциальность • Поддержка 24/7',
    
    // Categories Page
    categoriesTitle: 'Категории',
    categoriesSubtitle: 'Исследуйте наши специализированные категории продуктов',
    toolsCategory: 'Инструменты',
    toolsCategoryDesc: 'Профессиональные инструменты хакинга и безопасности',
    formationCategory: 'Обучение',
    formationCategoryDesc: 'Видеокурсы и учебные материалы',
    databaseCategory: 'Базы Данных',
    databaseCategoryDesc: 'Базы данных безопасности и словари',
    comptesCategory: 'Аккаунты',
    comptesCategoryDesc: 'Премиум аккаунты сервисов',
    
    // Admin
    adminPanel: 'Панель Администратора',
    secureAccess: 'Безопасный доступ к администрированию ZeroDay Shop',
    
    // Footer & Legal
    allRightsReserved: 'Все права защищены',
    unauthorizedUse: 'Несанкционированное использование этих инструментов может нарушать местные, государственные и федеральные законы.',
    legalNotice: 'Только для авторизованного тестирования безопасности'
  },
  
  zh: {
    // Navigation
    home: '首页',
    products: '产品',
    categories: '分类',
    guides: '指南',
    contact: '联系',
    
    // Interface
    search: '搜索...',
    cart: '购物车',
    
    // Page d'accueil
    title: 'ZeroDay Shop',
    subtitle: '为道德黑客提供的高级数字工具',
    browseProducts: '浏览产品',
    terminalCommand: 'root@zeroday:~#',
    featuredTools: '精选工具',
    osintTools: 'OSINT工具',
    osintDesc: '专业侦察工具用于情报收集',
    webPentest: 'Web渗透测试套件',
    webPentestDesc: '全面的Web应用程序测试工具',
    cryptoTools: '密码分析',
    cryptoDesc: '高级密码分析实用程序',
    pentestKits: '渗透测试套件',
    pentestDesc: '完整的渗透测试套件和框架',
    digitalGuides: '数字指南',
    guidesDesc: '专家安全文档和备忘单',
    
    // Contact Page
    contactTitle: '联系我们',
    contactSubtitle: '需要帮助？对我们的产品有疑问？请随时联系我们！',
    telegram: '电报',
    email: '安全邮件',
    telegramDesc: '直接在Telegram上联系我们以获得快速支持',
    emailDesc: '通过ProtonMail向我们发送安全邮件',
    faqTitle: '常见问题',
    techSupport: '技术支持',
    techSupportDesc: '下载问题、账户访问、错误',
    payments: '付款',
    paymentsDesc: '交易问题、退款',
    productsInfo: '产品',
    productsInfoDesc: '关于我们工具、培训、指南的信息',
    partnerships: '合作伙伴',
    partnershipsDesc: '合作、建议、提案',
    securityNotice: '加密通信 • 保证机密性 • 24/7支持',
    
    // Categories Page
    categoriesTitle: '分类',
    categoriesSubtitle: '探索我们的专业产品分类',
    toolsCategory: '工具',
    toolsCategoryDesc: '专业黑客和安全工具',
    formationCategory: '培训',
    formationCategoryDesc: '视频课程和教程',
    databaseCategory: '数据库',
    databaseCategoryDesc: '安全数据库和词表',
    comptesCategory: '账户',
    comptesCategoryDesc: '高级服务账户',
    
    // Admin
    adminPanel: '管理面板',
    secureAccess: 'ZeroDay Shop管理的安全访问',
    
    // Footer & Legal
    allRightsReserved: '版权所有',
    unauthorizedUse: '未经授权使用这些工具可能违反地方、州和联邦法律。',
    legalNotice: '仅用于授权的安全测试'
  },
  
  ar: {
    // Navigation
    home: 'الرئيسية',
    products: 'المنتجات',
    categories: 'الفئات',
    guides: 'الأدلة',
    contact: 'اتصل بنا',
    
    // Interface
    search: 'البحث...',
    cart: 'السلة',
    
    // Page d'accueil
    title: 'ZeroDay Shop',
    subtitle: 'أدوات رقمية متميزة للقراصنة الأخلاقيين',
    browseProducts: 'تصفح المنتجات',
    terminalCommand: 'root@zeroday:~#',
    featuredTools: 'الأدوات المميزة',
    osintTools: 'أدوات OSINT',
    osintDesc: 'أدوات استطلاع احترافية لجمع المعلومات الاستخباراتية',
    webPentest: 'مجموعة اختبار الويب',
    webPentestDesc: 'أدوات شاملة لاختبار تطبيقات الويب',
    cryptoTools: 'تحليل التشفير',
    cryptoDesc: 'أدوات متقدمة لتحليل التشفير',
    pentestKits: 'مجموعات اختبار الاختراق',
    pentestDesc: 'مجموعات كاملة لاختبار الاختراق والأطر',
    digitalGuides: 'الأدلة الرقمية',
    guidesDesc: 'وثائق أمان الخبراء وأوراق الغش',
    
    // Contact Page
    contactTitle: 'اتصل بنا',
    contactSubtitle: 'تحتاج مساعدة؟ أسئلة حول منتجاتنا؟ لا تتردد في الاتصال بنا!',
    telegram: 'تيليجرام',
    email: 'بريد آمن',
    telegramDesc: 'اتصل بنا مباشرة على Telegram للحصول على دعم سريع',
    emailDesc: 'أرسل لنا بريداً إلكترونياً آمناً عبر ProtonMail',
    faqTitle: 'الأسئلة المتكررة',
    techSupport: 'الدعم التقني',
    techSupportDesc: 'مشاكل التحميل، الوصول للحسابات، الأخطاء',
    payments: 'المدفوعات',
    paymentsDesc: 'أسئلة حول المعاملات، المردودات',
    productsInfo: 'المنتجات',
    productsInfoDesc: 'معلومات حول أدواتنا، التدريب، الأدلة',
    partnerships: 'الشراكات',
    partnershipsDesc: 'التعاونات، الاقتراحات، المقترحات',
    securityNotice: 'اتصالات مشفرة • سرية مضمونة • دعم ٢٤/٧',
    
    // Categories Page
    categoriesTitle: 'الفئات',
    categoriesSubtitle: 'استكشف فئات منتجاتنا المتخصصة',
    toolsCategory: 'الأدوات',
    toolsCategoryDesc: 'أدوات هاكينغ وأمان احترافية',
    formationCategory: 'التدريب',
    formationCategoryDesc: 'دورات فيديو ودروس تعليمية',
    databaseCategory: 'قواعد البيانات',
    databaseCategoryDesc: 'قواعد بيانات الأمان وقوائم الكلمات',
    comptesCategory: 'الحسابات',
    comptesCategoryDesc: 'حسابات خدمات مميزة',
    
    // Admin
    adminPanel: 'لوحة الإدارة',
    secureAccess: 'وصول آمن لإدارة ZeroDay Shop',
    
    // Footer & Legal
    allRightsReserved: 'جميع الحقوق محفوظة',
    unauthorizedUse: 'قد يؤدي الاستخدام غير المصرح به لهذه الأدوات إلى انتهاك القوانين المحلية والولائية والفيدرالية.',
    legalNotice: 'لاختبار الأمان المصرح به فقط'
  }
};

const useLanguageStore = create(
  persist(
    (set, get) => ({
      currentLanguage: 'en',
      translations: translations,
      
      // Changer la langue
      setLanguage: (language) => {
        if (translations[language]) {
          set({ currentLanguage: language });
        }
      },
      
      // Obtenir une traduction
      t: (key) => {
        const { currentLanguage, translations } = get();
        return translations[currentLanguage][key] || translations['en'][key] || key;
      },
      
      // Obtenir toutes les langues disponibles
      getAvailableLanguages: () => [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'ru', name: 'Русский', flag: '🇷🇺' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' }
      ]
    }),
    {
      name: 'zeroday-language',
      getStorage: () => localStorage,
    }
  )
);

export default useLanguageStore;