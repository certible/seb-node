import { z } from 'zod';

const urlFilterRuleSchema = z.object({
  active: z.boolean().default(true),
  regex: z.boolean().default(false),
  expression: z.string(),
  action: z.number().int().min(0).max(2).default(1), // 0=Block, 1=Allow, 2=Skip
});

// Additional Resource Schema
const additionalResourceSchema = z.object({
  active: z.boolean().default(true),
  autoOpen: z.boolean().default(false),
  confirm: z.boolean().default(false),
  iconInTaskbar: z.boolean().default(true),
  URL: z.url(),
  title: z.string(),
  linkURL: z.string().optional(),
  refererFilter: z.string().optional(),
  resourceDataFilename: z.string().optional(),
  resourceDataLauncher: z.string().optional(),
});

const processSchema = z.object({
  active: z.boolean().default(true),
  currentUser: z.boolean().default(true),
  executable: z.string(),
  identifier: z.string().optional(),
  os: z.number().int().min(0).max(2).default(0), // 0=Win, 1=Mac, 2=All
  originalName: z.string().optional(),
  description: z.string().optional(),
  strongKill: z.boolean().default(false),
  user: z.string().optional(),
  windowHandlingProcess: z.string().optional(),
});

const permittedProcessSchema = processSchema.extend({
  allowUser: z.boolean().default(false),
  arguments: z.array(z.string()).optional(),
  autostart: z.boolean().default(false),
  iconInTaskbar: z.boolean().default(true),
  runInBackground: z.boolean().default(false),
});

export const sebConfigSchema = z.object({
  // URLs and navigation
  startURL: z.url(),
  quitURL: z.string().default(''),
  restartExamURL: z.string().default(''),
  restartExamText: z.string().default(''),

  // Quit settings
  allowQuit: z.boolean().default(true),
  hashedQuitPassword: z.string().default(''),
  ignoreExitKeys: z.boolean().default(false),
  restartExamPasswordProtected: z.boolean().default(true),

  // Browser window settings
  browserViewMode: z.number().int().min(0).max(1).default(0), // 0=Window, 1=Fullscreen
  browserScreenKeyboard: z.boolean().default(false),
  touchOptimized: z.boolean().default(false),
  enableTouchExit: z.boolean().default(false),
  allowPreferencesWindow: z.boolean().default(false),
  showTaskBar: z.boolean().default(true),
  browserWindowAllowReload: z.boolean().default(true),
  browserWindowShowReloadWarning: z.boolean().default(false),
  newBrowserWindowByLinkPolicy: z.number().int().min(0).max(3).default(2),
  newBrowserWindowByScriptPolicy: z.number().int().min(0).max(3).default(2),
  browserWindowWebView: z.number().int().min(0).max(4).default(3),

  // Navigation
  allowBrowsingBackForward: z.boolean().default(false),
  enableBrowserWindowToolbar: z.boolean().default(false),
  hideBrowserWindowToolbar: z.boolean().default(false),
  showMenuBar: z.boolean().default(false),
  showReloadButton: z.boolean().default(true),
  showReloadWarning: z.boolean().default(false),

  // URL filtering
  enableURLFilter: z.boolean().default(false),
  enableURLContentFilter: z.boolean().default(false),
  urlFilterEnableContentFilter: z.boolean().default(false),
  urlFilterRules: z.array(urlFilterRuleSchema).default([]),

  // Media capture
  allowAudioCapture: z.boolean().default(false),
  allowVideoCapture: z.boolean().default(false),

  // Audio settings
  audioControlEnabled: z.boolean().default(true),
  audioMute: z.boolean().default(false),
  audioSetVolumeLevel: z.boolean().default(false),
  audioVolumeLevel: z.number().int().min(0).max(100).default(25),

  // Security and privacy
  allowSpellCheck: z.boolean().default(false),
  allowDictionaryLookup: z.boolean().default(false),
  allowPDFPlugIn: z.boolean().default(false),
  allowFlashFullscreen: z.boolean().default(false),
  allowScreenSharing: z.boolean().default(false),
  allowDisplayMirroring: z.boolean().default(false),
  allowSiri: z.boolean().default(false),
  allowDictation: z.boolean().default(false),
  allowAirPlay: z.boolean().default(false),

  // System
  allowSwitchToApplications: z.boolean().default(false),
  allowUserSwitching: z.boolean().default(false),
  allowVirtualMachine: z.boolean().default(false),

  // Downloading
  allowDownUploads: z.boolean().default(false),
  downloadDirectoryOSX: z.string().default(''),
  downloadDirectoryWin: z.string().default(''),
  openDownloads: z.boolean().default(false),

  // Network
  allowWlan: z.boolean().default(true),

  // Browser Exam Key
  sendBrowserExamKey: z.boolean().default(true),
  browserExamKeySalt: z.boolean().default(true),
  browserURLSalt: z.boolean().default(true),

  // Logging
  allowApplicationLog: z.boolean().default(false),
  logDirectoryOSX: z.string().default(''),
  logDirectoryWin: z.string().default(''),

  // Display
  allowedDisplaysMaxNumber: z.number().int().min(1).default(1),
  allowedDisplayBuiltin: z.boolean().default(true),

  // Windows specific
  createNewDesktop: z.boolean().default(true),
  killExplorerShell: z.boolean().default(false),

  // macOS specific
  enablePrivateClipboard: z.boolean().default(true),

  // Zoom
  enableZoomPage: z.boolean().default(true),
  enableZoomText: z.boolean().default(true),
  zoomMode: z.number().int().min(0).max(2).default(0),

  // Resources and processes
  additionalResources: z.array(additionalResourceSchema).default([]),
  prohibitedProcesses: z.array(processSchema).default([]),
  permittedProcesses: z.array(permittedProcessSchema).default([]),

  // Monitoring
  monitorProcesses: z.boolean().default(true),

  // Exam key salt
  examKeySalt: z.instanceof(Buffer).default(Buffer.alloc(0)),

  // Version metadata
  originatorVersion: z.string().default('3.7.0'),

  // Additional common settings
  browserMessagingSocket: z.string().optional(),
  browserMessagingSocketEnabled: z.boolean().default(false),
  browserUserAgent: z.string().optional(),
  browserUserAgentMac: z.number().int().optional(),
  browserUserAgentWin: z.number().int().optional(),
  
  // Exam settings
  examSessionClearCookiesOnEnd: z.boolean().default(true),
  examSessionClearCookiesOnStart: z.boolean().default(true),
  
  // Additional security
  detectStoppedProcess: z.boolean().default(true),
  enableAppSwitcherCheck: z.boolean().default(true),
  forceAppFolderInstall: z.boolean().default(true),
  
  // Registry and configuration
  sebConfigPurpose: z.number().int().min(0).max(1).default(0), // 0=StartingExam, 1=ConfiguringClient
  sebMode: z.number().int().min(0).max(2).default(0), // 0=Browser, 1=ConfigTool, 2=PendingUpdate
  
  // Service policy
  sebServicePolicy: z.number().int().min(0).max(2).default(0),
});

export type SEBConfig = z.infer<typeof sebConfigSchema>;
export type URLFilterRule = z.infer<typeof urlFilterRuleSchema>;
export type AdditionalResource = z.infer<typeof additionalResourceSchema>;
export type Process = z.infer<typeof processSchema>;
export type PermittedProcess = z.infer<typeof permittedProcessSchema>;
