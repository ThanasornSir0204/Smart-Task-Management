export interface Messages {
  appName: string;
  nav: {
    dashboard: string;
    focus: string;
    trash: string;
    profile: string;
    landing: string;
    login: string;
  };
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    restore: string;
    loading: string;
    search: string;
    all: string;
    confirm: string;
    success: string;
    error: string;
    logout: string;
    language: string;
  };
  dashboard: {
    summary: string;
    progress: string;
    addTask: string;
    filters: string;
    taskList: string;
    templates: string;
    leaderboard: string;
    streak: string;
    streakDays: string;
    weeklyChart: string;
    overdueOnly: string;
    sortBy: string;
    tags: string;
    priority: string;
    subtasks: string;
    sticker: string;
    pomodoroUsed: string;
    minutes: string;
    history: string;
    noHistory: string;
    emptyTrash: string;
    enableNotify: string;
  };
  focus: {
    title: string;
    selectTask: string;
    start: string;
    pause: string;
    reset: string;
    complete: string;
  };
  profile: {
    title: string;
    displayName: string;
    avatarUrl: string;
    accent: string;
    leaderboardOptIn: string;
    notifications: string;
    invite: string;
    copyInvite: string;
    referred: string;
  };
  landing: {
    hero: string;
    cta: string;
    demo: string;
    features: string;
  };
  trash: {
    title: string;
    permanentDelete: string;
    empty: string;
  };
}
