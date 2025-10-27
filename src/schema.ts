/* Schema definition for Safe Exam Browser (SEB) configuration files */
/* @see https://safeexambrowser.org/developer/documents/SEB-Specification-ConfigKeys.pdf */

import { z } from 'zod';

const urlFilterRuleSchema = z.object({
  active: z.boolean().default(true).describe('Boolean indicating if the action is active'),
  regex: z.boolean().default(false).describe('Boolean indicating if the action rule is a regular expression. If regex is set to false, then the rule is formatted using the wildcard * (stands for an arbitrary string of any length)'),
  expression: z.string().describe('String containing the filtering expression or pattern, either in the regular expression format (regex = true) or (regex = false) a simpler filter expression containing the wildcard char <*>'),
  action: z.number().int().min(0).max(2).default(1).describe('Integer with a value representing one of the URLFilterRuleActions: 0=Block, 1=Allow, 2=Skip'),
});

// Additional Resource Schema
const additionalResourceSchema = z.object({
  active: z.boolean().default(true).describe('Boolean indicating if the additional resource is active'),
  autoOpen: z.boolean().default(false).describe('Boolean indicating whether the additional resource is opened automatically when SEB starts. If the resource is not opened automatically, then users have to click the resource\'s icon in the SEB task bar to open it'),
  confirm: z.boolean().default(false),
  iconInTaskbar: z.boolean().default(true),
  URL: z.url().describe('String containing the URL or filename of the resource. If the resource is external, then the URL has to start with the right URL scheme, for example http:// or file://'),
  title: z.string().describe('String with the resource title which is displayed in the task bar'),
  linkURL: z.string().optional(),
  refererFilter: z.string().optional(),
  resourceDataFilename: z.string().optional(),
  resourceDataLauncher: z.string().optional(),
});

const processSchema = z.object({
  active: z.boolean().default(true).describe('Boolean indicating if the prohibited process is active'),
  currentUser: z.boolean().default(true).describe('Boolean indicating that the prohibited process has to run under the currently logged in user (not system users)'),
  executable: z.string().describe('String of the process name (usually the file name of the executable)'),
  identifier: z.string().optional().describe('String of the process identifier in reverse domain notation (Mac) or the string or substring of the main window title of a process'),
  os: z.number().int().min(0).max(2).default(0).describe('Integer with a value representing on which operating system the permitted process runs: 0=Win, 1=Mac, 2=All'),
  originalName: z.string().optional().describe('String containing the original filename meta data of the executable (only available in Windows)'),
  description: z.string().optional().describe('String containing a description of the process. This is only displayed in the SEB configuration tool, preferences window and in logs'),
  strongKill: z.boolean().default(false).describe('Boolean indicating whether an application (or process) may be killed in a not-nice way, what may cause data loss'),
  user: z.string().optional().describe('String with the user identifier under which this process is running'),
  windowHandlingProcess: z.string().optional(),
});

const permittedProcessSchema = processSchema.extend({
  allowUser: z.boolean().default(false),
  arguments: z.array(z.string()).optional(),
  autostart: z.boolean().default(false),
  iconInTaskbar: z.boolean().default(true),
  runInBackground: z.boolean().default(false),
});

export const sebConfigSchema = z.looseObject({
  // URLs and navigation
  startURL: z.url().describe('String containing the full URL (starting with http:// or https://) of the page to open when SEB is started'),
  quitURL: z.string().default('').describe('String containing the full URL (starting with http:// or https://) of the link to quit SEB/the exam session after the exam'),
  restartExamURL: z.string().default('').describe('Either check the "Use Start URL" option or enter a link to which the exam is redirected when the Back to Start Button is pressed'),
  restartExamText: z.string().default('').describe('This text is displayed as the title of the confirmation alert and as tool tip on the icon'),

  // Quit settings
  allowQuit: z.boolean().default(true).describe('Boolean indicating if quitting SEB by key combination, menu entry or window closing button is allowed'),
  hashedQuitPassword: z.string().default('').describe('String containing Base16 encoded data representing a SHA256 hash of the password which is prompted when users try to quit SEB'),
  hashedAdminPassword: z.string().default('').describe('String containing Base16 encoded data representing a SHA256 hash of the password required to enter the preferences window or to open a .seb configuration file for editing'),
  ignoreExitKeys: z.boolean().default(false).describe('Boolean indicating if SEB is ignoring the exit keys for quitting SEB by pressing and holding down three function keys in a specific order'),
  restartExamPasswordProtected: z.boolean().default(true).describe('Boolean indicating if the quit/restart password must be entered when the restart exam button was tapped'),
  restartExamUseStartURL: z.boolean().default(false).describe('Boolean indicating if the Start URL should be used when the Back to Start Button is pressed'),
  quitURLConfirm: z.boolean().default(true).describe('Boolean indicating if the user is asked to confirm quitting SEB after the quit URL has been detected'),
  quitURLRestart: z.boolean().default(true).describe('Boolean indicating if the exam session in SEB is restarted after the quit URL has been detected instead of quitting it'),

  // Browser window settings
  browserViewMode: z.number().int().min(0).max(1).default(0).describe('Integer with a value representing one of the browserViewModes: 0=Window, 1=Fullscreen'),
  browserScreenKeyboard: z.boolean().default(false).describe('Boolean instructing the browser whether it should send a socket message when a text box gets and loses input focus'),
  touchOptimized: z.boolean().default(false).describe('Boolean indicating touch optimized appearance'),
  enableTouchExit: z.boolean().default(false),
  allowPreferencesWindow: z.boolean().default(false).describe('Boolean indicating if users are allowed to open the preferences window on exam clients'),
  showTaskBar: z.boolean().default(true).describe('Boolean indicating if the SEB dock/taskbar should be displayed'),
  browserWindowAllowReload: z.boolean().default(true).describe('Boolean indicating if reload is allowed in main browser window'),
  browserWindowShowReloadWarning: z.boolean().default(false).describe('Boolean indicating if a warning should be displayed before reloading the web page'),
  newBrowserWindowByLinkPolicy: z.number().int().min(0).max(3).default(2).describe('Integer with a value representing one of the newBrowserWindowPolicies: 0=getGenerallyBlocked, 1=openInSameWindow, 2=openInNewWindow'),
  newBrowserWindowByScriptPolicy: z.number().int().min(0).max(3).default(2).describe('Integer with a value representing one of the newBrowserWindowPolicies for hyperlinks opened from JavaScript or plug-ins'),
  newBrowserWindowAllowReload: z.boolean().default(true).describe('Boolean indicating if reload is allowed in additional browser windows'),
  newBrowserWindowNavigation: z.boolean().default(true).describe('Boolean indicating if browsing back to previously visited pages is allowed in additional browser windows'),
  newBrowserWindowShowReloadWarning: z.boolean().default(false).describe('Boolean indicating if a warning should be displayed before reloading the web page in an additional browser window'),
  browserWindowWebView: z.number().int().min(0).max(4).default(3).describe('Integer with a value representing the browser engine to use, 3 - Prefer Modern WebView, 4 - Force Modern WebView is needed for config key to work.'),

  // Navigation
  allowBrowsingBackForward: z.boolean().default(false).describe('Boolean indicating if browsing back to previously visited pages (and forward again) according to the browser history is allowed'),
  enableBrowserWindowToolbar: z.boolean().default(false).describe('Boolean indicating if a toolbar is displayed on top of the browser window'),
  hideBrowserWindowToolbar: z.boolean().default(false).describe('Boolean indicating if the browser window toolbar should be hidden by default'),
  showMenuBar: z.boolean().default(false).describe('Boolean indicating if the Mac OS X menu bar including all menus should be displayed or not'),
  showReloadButton: z.boolean().default(true).describe('Boolean indicating if the reload button should be displayed in the SEB dock/taskbar'),
  showReloadWarning: z.boolean().default(false).describe('Boolean indicating if a warning should be displayed before reloading the web page in the main browser window'),
  browserWindowAllowAddressBar: z.boolean().default(false).describe('Boolean indicating whether the address bar in the main browser window is displayed and editable or not'),
  allowFind: z.boolean().default(true).describe('Boolean indicating whether the page search functionality of the integrated browser is allowed or not'),

  // URL filtering
  enableURLFilter: z.boolean().default(false).describe('Boolean indicating if URLs are filtered using the URLFilterRules dictionary'),
  enableURLContentFilter: z.boolean().default(false).describe('Boolean indicating if not only URLs are filtered, but also all embedded resources'),
  urlFilterEnableContentFilter: z.boolean().default(false).describe('Boolean indicating if not only URLs are filtered, but also all embedded resources'),
  urlFilterRules: z.array(urlFilterRuleSchema).default([]).describe('Array of dictionaries each containing a set of URL filter rules'),
  blockPopUpWindows: z.boolean().default(false).describe('Boolean indicating if pop-up windows (often advertisement) opened by JavaScript without an user action such as a button click are blocked'),

  // Media capture
  allowAudioCapture: z.boolean().default(false).describe('Boolean indicating if web applications are allowed to access the default microphone (using HTML 5 APIs)'),
  allowVideoCapture: z.boolean().default(false).describe('Boolean indicating if web applications are allowed to access the default camera (using HTML 5 APIs)'),

  // Audio settings
  audioControlEnabled: z.boolean().default(false).describe('Boolean indicating if the audio control should be displayed in the SEB task bar'),
  audioMute: z.boolean().default(false).describe('Boolean indicating if audio should be muted when the SEB session is started'),
  audioSetVolumeLevel: z.boolean().default(false).describe('Boolean indicating if the audio volume level should be set to the value of audioVolumeLevel when the SEB session is started'),
  audioVolumeLevel: z.number().int().min(0).max(100).default(25).describe('Integer indicating the initial audio level (in percent) when the SEB session is started'),

  // Security and privacy
  allowSpellCheck: z.boolean().default(false).describe('Boolean indicating if users are allowed to use the browser\'s spelling check'),
  allowDictionaryLookup: z.boolean().default(false).describe('Boolean indicating if looking up text elements on a web site using the 3-finger tap on a trackpad or ctrl-cmd-D should be allowed'),
  allowPDFPlugIn: z.boolean().default(false).describe('Boolean indicating if the Acrobat Reader PDF plugin (insecure) will be allowed to display PDF files in browser windows'),
  allowFlashFullscreen: z.boolean().default(false).describe('Boolean indicating if Flash is allowed to switch on fullscreen presentation'),
  allowScreenSharing: z.boolean().default(false).describe('Boolean indicating if macOS network screen sharing (VNC based) and Windows remote session (RDP) is allowed to be used'),
  allowDisplayMirroring: z.boolean().default(false).describe('Boolean indicating if mirroring the main display to another (for example an AirPlay Display) should be allowed'),
  allowSiri: z.boolean().default(false).describe('Boolean indicating if Siri is allowed to be used'),
  allowDictation: z.boolean().default(false).describe('Boolean indicating if it is allowed to use dictation (speech-to-text)'),
  allowAirPlay: z.boolean().default(false),

  // System
  allowSwitchToApplications: z.boolean().default(false).describe('Boolean indicating if users are allowed to switch to permitted applications'),
  allowUserSwitching: z.boolean().default(false).describe('Boolean indicating if fast user switching is allowed'),
  allowVirtualMachine: z.boolean().default(false).describe('Boolean indicating if SEB is allowed to run on a virtual machine or not'),

  // Downloading
  allowDownUploads: z.boolean().default(false).describe('Boolean indicating if downloading and uploading files is allowed'),
  downloadDirectoryOSX: z.string().default('').describe('String representing the path of the directory to which downloaded files will be saved (Mac)'),
  downloadDirectoryWin: z.string().default('').describe('String representing the path of the directory to which downloaded files will be saved (Windows)'),
  openDownloads: z.boolean().default(false).describe('Boolean indicating if downloaded files will be opened with the according application'),
  downloadAndOpenSebConfig: z.boolean().default(true).describe('Boolean indicating if .seb config files should be downloaded and opened, regardless if downloading and opening of other file types is allowed or not'),
  downloadPDFFiles: z.boolean().default(false).describe('Boolean indicating if PDF files should be downloaded or displayed online inside the browser window'),
  allowPDFReaderToolbar: z.boolean().default(false).describe('Boolean indicating whether the toolbar of the internal PDF reader is enabled'),

  // Network
  allowWlan: z.boolean().default(false).describe('Boolean indicating if the WLAN control should be displayed in the SEB task bar'),

  // Browser Exam Key
  sendBrowserExamKey: z.boolean().default(true).describe('Boolean indicating if the Browser Exam Key (BEK) and Config Key (CK) should be sent in a custom HTTP request header'),
  browserExamKeySalt: z.boolean().default(true).describe('Boolean indicating if a salt should be used for the Browser Exam Key'),
  browserURLSalt: z.boolean().default(true).describe('Boolean instructing the browser whether it should use the full URL of a HTTP request as salt when generating the Browser Exam Key request header field'),
  examKeySalt: z.instanceof(Buffer).default(Buffer.alloc(0)).describe('Data representing a random salt value which is used to generate the browser exam key'),
  configKeySalt: z.instanceof(Buffer).default(Buffer.alloc(0)).describe('Data representing a random salt value which is used to increase the entropy of the Config Key'),

  // Logging
  allowApplicationLog: z.boolean().default(false).describe('Boolean indicating whether any log information is accessible via the user interface'),
  enableLogging: z.boolean().default(false).describe('Boolean indicating if SEB writes a log'),
  logDirectoryOSX: z.string().default('').describe('String representing the path of the directory to which log files will be saved (Mac)'),
  logDirectoryWin: z.string().default('').describe('String representing the Windows formatted path of the directory to which log files will be saved'),

  // Display
  allowedDisplaysMaxNumber: z.number().int().min(1).default(1).describe('Integer value indicating the maximum allowed number of connected displays'),
  allowedDisplayBuiltin: z.boolean().default(true).describe('Boolean indicating if the built-in display should be used when only one display is allowed'),

  // Windows specific
  createNewDesktop: z.boolean().default(true).describe('Boolean indicating if SEB should be executed in a newly created desktop window'),
  killExplorerShell: z.boolean().default(false).describe('Boolean indicating if the Windows Explorer Shell should be killed when starting SEB'),

  // macOS specific
  enablePrivateClipboard: z.boolean().default(true).describe('Boolean indicating if SEB should use a clipboard which allows to only cut/copy/paste from and into SEB browser windows'),

  // Zoom
  enableZoomPage: z.boolean().default(true).describe('Boolean indicating if pages can be zoomed'),
  enableZoomText: z.boolean().default(true).describe('Boolean indicating if text in browser windows can be zoomed'),
  zoomMode: z.number().int().min(0).max(2).default(0).describe('Integer with a value representing one of the SEBZoomModes: 0=Page, 1=Text'),

  // Resources and processes
  additionalResources: z.array(additionalResourceSchema).default([]).describe('Array of additionalResource dictionaries containing additional resources which can be used during an exam'),
  prohibitedProcesses: z.array(processSchema).default([]).describe('Array of dictionaries which contain the properties of processes which are prohibited to run during an exam'),
  permittedProcesses: z.array(permittedProcessSchema).default([]).describe('Array of dictionaries containing the properties of permitted third party applications and processes'),

  // Monitoring
  monitorProcesses: z.boolean().default(true).describe('Boolean indicating if SEB is monitoring which processes (and applications) are running during an exam'),

  // Version metadata
  originatorVersion: z.string().default('3.7.0').describe('Version information about the SEB application which saved the configuration file'),

  // Additional common settings
  browserMessagingSocket: z.string().optional().describe('String containing a service URL for the socket server'),
  browserMessagingSocketEnabled: z.boolean().default(false).describe('Boolean indicating if browser messaging socket is enabled'),
  browserUserAgent: z.string().optional().describe('String suffix which is appended to the current user agent'),
  browserUserAgentMac: z.number().int().optional().describe('Integer with a value representing one browserUserAgentModeMac'),
  browserUserAgentWin: z.number().int().optional().describe('Integer with a value representing one browserUserAgentModeWin'),
  enableSebBrowser: z.boolean().default(true).describe('Boolean indicating if the SEB browser should be used'),
  showTime: z.boolean().default(true).describe('Boolean indicating if the current time should be displayed in the SEB dock/taskbar'),

  // Exam settings
  examSessionClearCookiesOnEnd: z.boolean().default(true).describe('Boolean indicating if session cookies should be cleared when ending the current exam session'),
  examSessionClearCookiesOnStart: z.boolean().default(true).describe('Boolean indicating if session cookies should be cleared when starting the current exam session'),

  // Additional security
  detectStoppedProcess: z.boolean().default(true).describe('Boolean indicating that it should be detected if the SEB process is stopped'),
  enableAppSwitcherCheck: z.boolean().default(true).describe('Boolean indicating whether SEB checks for the command key being held down while SEB is starting up'),
  forceAppFolderInstall: z.boolean().default(true).describe('Boolean indicating if SEB enforces to be installed in an Applications folder'),
  pinEmbeddedCertificates: z.boolean().default(false).describe('Boolean indicating if the certificate store should not be used to evaluate the validity of a server certificate'),
  removeBrowserProfile: z.boolean().default(false).describe('Boolean indicating if the browser profile should be removed when quitting SEB'),
  removeLocalStorage: z.boolean().default(false).describe('Boolean indicating if the browser\'s local storage database should be disabled'),

  // Network and proxy settings
  proxySettingsPolicy: z.number().int().min(0).max(1).default(0).describe('Integer with a value representing one of the proxySettingsPolicies: 0=useSystemProxySettings, 1=useSEBProxySettings'),

  // Registry and configuration
  sebConfigPurpose: z.number().int().min(0).max(1).default(0).describe('Integer with a value representing one of the sebConfigPurposes: 0=StartingExam, 1=ConfiguringClient'),
  sebMode: z.number().int().min(0).max(2).default(0).describe('Integer with a value representing one of the sebModes: 0=Browser, 1=ConfigTool, 2=PendingUpdate'),

  // Service policy
  sebServicePolicy: z.number().int().min(0).max(2).default(0).describe('Integer with a value representing one of the sebServicePolicies: 0=ignoreService, 1=indicateMissingService, 2=forceSebService'),

  /* required,partial hack to not apply defaults */
  /* see https://github.com/colinhacks/zod/issues/5235 */
}).required().partial(); 

export type SEBConfig = z.infer<typeof sebConfigSchema>;
export type URLFilterRule = z.infer<typeof urlFilterRuleSchema>;
export type AdditionalResource = z.infer<typeof additionalResourceSchema>;
export type Process = z.infer<typeof processSchema>;
export type PermittedProcess = z.infer<typeof permittedProcessSchema>;
