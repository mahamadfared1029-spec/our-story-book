export type Locale = "ar" | "ku" | "en";

export const DEFAULT_LOCALE: Locale = "ar";
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

export interface LocaleConfig {
  code: Locale;
  name: string;
  nativeName: string;
  dir: "rtl" | "ltr";
  langCode: string; // "ar" | "ckb" | "en"
}

export const SUPPORTED_LOCALES: Record<Locale, LocaleConfig> = {
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    langCode: "ar",
  },
  ku: {
    code: "ku",
    name: "Kurdish (Sorani)",
    nativeName: "کوردی",
    dir: "rtl",
    langCode: "ckb",
  },
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    langCode: "en",
  },
};

export interface Dictionary {
  common: {
    appName: string;
    tagline: string;
    loading: string;
    save: string;
    saving: string;
    cancel: string;
    delete: string;
    deleting: string;
    edit: string;
    back: string;
    confirm: string;
    close: string;
    created: string;
    updated: string;
    login: string;
    signup: string;
    logout: string;
    partner: string;
    creator: string;
    daysTogether: string;
    photos: string;
    chapters: string;
    milestones: string;
    days: string;
    months: string;
    years: string;
    day: string;
    month: string;
    year: string;
    and: string;
  };
  nav: {
    myBooks: string;
    newBook: string;
    timeline: string;
    previewBook: string;
    printBook: string;
    settings: string;
    invitePartner: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    startStory: string;
    myBooksTitle: string;
    createFirstBook: string;
    emptyBooks: string;
    emptyBooksSub: string;
    featuresTitle: string;
    privacyFeature: string;
    privacyDesc: string;
    timelineFeature: string;
    timelineDesc: string;
    printFeature: string;
    printDesc: string;
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    signupTitle: string;
    signupSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    displayNameLabel: string;
    displayNamePlaceholder: string;
    noAccount: string;
    haveAccount: string;
    loginButton: string;
    signupButton: string;
  };
  book: {
    createTitle: string;
    createSubtitle: string;
    bookTitleLabel: string;
    bookTitlePlaceholder: string;
    partner1Label: string;
    partner1Placeholder: string;
    partner2Label: string;
    partner2Placeholder: string;
    startDateLabel: string;
    startDateHint: string;
    submitCreate: string;
    creating: string;
    statsTitle: string;
    daysCounterSuffix: string;
    emptyChaptersTitle: string;
    emptyChaptersSub: string;
    addFirstChapter: string;
  };
  chapter: {
    newTitle: string;
    newSubtitle: string;
    editTitle: string;
    editSubtitle: string;
    titleLabel: string;
    titlePlaceholder: string;
    dateLabel: string;
    locationLabel: string;
    locationPlaceholder: string;
    moodLabel: string;
    milestoneLabel: string;
    milestoneHelp: string;
    milestoneTypeLabel: string;
    bodyLabel: string;
    bodyPlaceholder: string;
    photosLabel: string;
    photosHint: string;
    uploadPhotos: string;
    saveChapter: string;
    savingChapter: string;
    deleteChapter: string;
    confirmDelete: string;
  };
  prompts: {
    title: string;
    subtitle: string;
    usePrompt: string;
  };
  reader: {
    coverTitle: string;
    dedication: string;
    dedicationText: string;
    contents: string;
    epilogue: string;
    epilogueText: string;
    nextPage: string;
    prevPage: string;
    fullscreen: string;
    exitFullscreen: string;
    shareLink: string;
    linkCopied: string;
    page: string;
    of: string;
  };
  print: {
    toolbarTitle: string;
    printButton: string;
    backToBook: string;
    tipsTitle: string;
    tipGraphics: string;
    tipMargins: string;
  };
  settings: {
    title: string;
    subtitle: string;
    generalSection: string;
    generalSubtitle: string;
    membersSection: string;
    membersSubtitle: string;
    dangerSection: string;
    dangerSubtitle: string;
    deleteBookWarning: string;
    typeToConfirm: string;
    deleteConfirmButton: string;
    onlyCreatorCanDelete: string;
  };
  invites: {
    invitePartnerTitle: string;
    invitePartnerSub: string;
    generateButton: string;
    generating: string;
    copyLink: string;
    copied: string;
    shareHint: string;
    expiresIn: string;
    revokeButton: string;
    alreadyHasPartner: string;
  };
}
