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

export const sebConfigSchema = z.object({
  
  // ==================================================================================
  // GENERAL SETTINGS
  // ==================================================================================
  
  // Start URL and navigation
  startURL: z.url().describe('String containing the full URL (starting with http:// or https://) of the page to open when SEB is started'),
  quitURL: z.string().default('').describe('String containing the full URL (starting with http:// or https://) of the link to quit SEB/the exam session after the exam'),
  restartExamURL: z.string().default('').describe('Either check the "Use Start URL" option or enter a link to which the exam is redirected when the Back to Start Button is pressed'),
  restartExamText: z.string().default('').describe('This text is displayed as the title of the confirmation alert and as tool tip on the icon'),
  restartExamUseStartURL: z.boolean().default(false).describe('Boolean indicating if the Start URL should be used when the Back to Start Button is pressed'),
  restartExamPasswordProtected: z.boolean().default(true).describe('Boolean indicating if the quit/restart password must be entered when the restart exam button was tapped'),
  
  // Quit and security settings
  allowQuit: z.boolean().default(true).describe('Boolean indicating if quitting SEB by key combination, menu entry or window closing button is allowed'),
  hashedQuitPassword: z.string().default('').describe('String containing Base16 encoded data representing a SHA256 hash of the password which is prompted when users try to quit SEB'),
  hashedAdminPassword: z.string().default('').describe('String containing Base16 encoded data representing a SHA256 hash of the password required to enter the preferences window or to open a .seb configuration file for editing'),
  ignoreExitKeys: z.boolean().default(false).describe('Boolean indicating if SEB is ignoring the exit keys for quitting SEB by pressing and holding down three function keys in a specific order'),
  quitURLConfirm: z.boolean().default(true).describe('Boolean indicating if the user is asked to confirm quitting SEB after the quit URL has been detected'),
  quitURLRestart: z.boolean().default(true).describe('Boolean indicating if the exam session in SEB is restarted after the quit URL has been detected instead of quitting it'),
  ignoreQuitPassword: z.boolean().default(false).describe('Boolean indicating if the quit password should be ignored'),
  
  // Configuration settings
  allowPreferencesWindow: z.boolean().default(false).describe('Boolean indicating if users are allowed to open the preferences window on exam clients'),
  
  // ==================================================================================
  // USER INTERFACE / APPEARANCE
  // ==================================================================================
  
  // Browser window and view settings
  browserViewMode: z.number().int().min(0).max(1).default(0).describe('Integer with a value representing one of the browserViewModes: 0=Window, 1=Fullscreen'),
  mainBrowserWindowHeight: z.string().default('').describe('String representing the height of the main browser window'),
  mainBrowserWindowPositioning: z.number().int().default(0).describe('Integer representing the positioning of the main browser window'),
  mainBrowserWindowWidth: z.string().default('').describe('String representing the width of the main browser window'),
  
  // Toolbar and navigation display
  enableBrowserWindowToolbar: z.boolean().default(false).describe('Boolean indicating if a toolbar is displayed on top of the browser window'),
  hideBrowserWindowToolbar: z.boolean().default(false).describe('Boolean indicating if the browser window toolbar should be hidden by default'),
  browserWindowAllowAddressBar: z.boolean().default(false).describe('Boolean indicating whether the address bar in the main browser window is displayed and editable or not'),
  
  // Task bar and menu settings
  showTaskBar: z.boolean().default(true).describe('Boolean indicating if the SEB dock/taskbar should be displayed'),
  showMenuBar: z.boolean().default(false).describe('Boolean indicating if the Mac OS X menu bar including all menus should be displayed or not'),
  showReloadButton: z.boolean().default(true).describe('Boolean indicating if the reload button should be displayed in the SEB dock/taskbar'),
  showTime: z.boolean().default(true).describe('Boolean indicating if the current time should be displayed in the SEB dock/taskbar'),
  
  // Touch and mobile optimizations
  touchOptimized: z.boolean().default(false).describe('Boolean indicating touch optimized appearance'),
  browserScreenKeyboard: z.boolean().default(false).describe(''),
  enableTouchExit: z.boolean().default(false).describe('Boolean indicating if touch exit is enabled'),
  oskBehavior: z.number().int().default(0).describe('Integer representing the on-screen keyboard behavior'),

  // ==================================================================================
  // BROWSER SETTINGS
  // ==================================================================================
  
  // Browser engine and core functionality
  enableSebBrowser: z.boolean().default(true).describe('Boolean indicating if the SEB browser should be used'),
  browserWindowWebView: z.number().int().min(0).max(4).default(3).describe('Integer with a value representing the browser engine to use, 3 - Prefer Modern WebView, 4 - Force Modern WebView is needed for config key to work.'),
  
  // Page reload and navigation
  browserWindowAllowReload: z.boolean().default(true).describe('Boolean indicating if reload is allowed in main browser window'),
  browserWindowShowReloadWarning: z.boolean().default(false).describe('Boolean indicating if a warning should be displayed before reloading the web page'),
  showReloadWarning: z.boolean().default(false).describe('Boolean indicating if a warning should be displayed before reloading the web page in the main browser window'),
  allowBrowsingBackForward: z.boolean().default(false).describe('Boolean indicating if browsing back to previously visited pages (and forward again) according to the browser history is allowed'),
  
  // New window policies
  newBrowserWindowByLinkPolicy: z.number().int().min(0).max(3).default(2).describe('Integer with a value representing one of the newBrowserWindowPolicies: 0=getGenerallyBlocked, 1=openInSameWindow, 2=openInNewWindow'),
  newBrowserWindowByScriptPolicy: z.number().int().min(0).max(3).default(2).describe('Integer with a value representing one of the newBrowserWindowPolicies for hyperlinks opened from JavaScript or plug-ins'),
  newBrowserWindowAllowReload: z.boolean().default(true).describe('Boolean indicating if reload is allowed in additional browser windows'),
  newBrowserWindowNavigation: z.boolean().default(true).describe('Boolean indicating if browsing back to previously visited pages is allowed in additional browser windows'),
  newBrowserWindowShowReloadWarning: z.boolean().default(false).describe('Boolean indicating if a warning should be displayed before reloading the web page in an additional browser window'),
  newBrowserWindowAllowAddressBar: z.boolean().default(false).describe('Boolean indicating if additional browser windows should have an address bar'),
  newBrowserWindowByLinkBlockForeign: z.boolean().default(false).describe('Boolean indicating if links to foreign domains should be blocked in new windows'),
  newBrowserWindowByLinkHeight: z.string().default('').describe('String representing the height of new browser windows opened by links'),
  newBrowserWindowByLinkPositioning: z.number().int().default(0).describe('Integer representing the positioning of new browser windows opened by links'),
  newBrowserWindowByLinkWidth: z.string().default('').describe('String representing the width of new browser windows opened by links'),
  newBrowserWindowByScriptBlockForeign: z.boolean().default(false).describe('Boolean indicating if scripts opening foreign domains should be blocked'),
  newBrowserWindowShowURL: z.number().int().default(0).describe('Integer representing how URLs should be shown in new browser windows'),
  
  // Pop-up and window management
  blockPopUpWindows: z.boolean().default(false).describe('Boolean indicating if pop-up windows (often advertisement) opened by JavaScript without an user action such as a button click are blocked'),
  browserWindowShowURL: z.number().int().default(0).describe('Integer representing how URLs should be shown in browser windows'),
  browserWindowTitleSuffix: z.string().default('').describe('String suffix to be appended to browser window titles'),
  
  // Web technologies and plugins
  enablePlugIns: z.boolean().default(false).describe('Boolean indicating if browser plug-ins are enabled'),
  enableJava: z.boolean().default(false).describe('Boolean indicating if Java support is enabled'),
  allowPDFPlugIn: z.boolean().default(false).describe('Boolean indicating if the Acrobat Reader PDF plugin (insecure) will be allowed to display PDF files in browser windows'),
  allowFlashFullscreen: z.boolean().default(false).describe('Boolean indicating if Flash is allowed to switch on fullscreen presentation'),
  
  // Page search and content tools
  allowFind: z.boolean().default(true).describe('Boolean indicating whether the page search functionality of the integrated browser is allowed or not'),
  allowSpellCheck: z.boolean().default(false).describe('Boolean indicating if users are allowed to use the browser\'s spelling check'),
  allowDictionaryLookup: z.boolean().default(false).describe('Boolean indicating if looking up text elements on a web site using the 3-finger tap on a trackpad or ctrl-cmd-D should be allowed'),
  
  // Browser privacy and storage
  removeBrowserProfile: z.boolean().default(false).describe('Boolean indicating if the browser profile should be removed when quitting SEB'),
  removeLocalStorage: z.boolean().default(false).describe('Boolean indicating if the browser\'s local storage database should be disabled'),
  enablePrivateClipboard: z.boolean().default(true).describe('Boolean indicating if SEB should use a clipboard which allows to only cut/copy/paste from and into SEB browser windows'),
  enablePrivateClipboardMacEnforce: z.boolean().default(false).describe('Boolean indicating if the private clipboard should be enforced on macOS'),
  
  // User agent settings
  browserUserAgent: z.string().optional().describe('String suffix which is appended to the current user agent'),
  browserUserAgentMac: z.number().int().optional().describe('Integer with a value representing one browserUserAgentModeMac'),
  browserUserAgentMacCustom: z.string().default('').describe('Custom user agent string for macOS'),
  browserUserAgentWin: z.number().int().optional().describe('Integer with a value representing one browserUserAgentModeWin'),
  browserUserAgentWinDesktopMode: z.number().int().default(0).describe('Integer representing the Windows desktop mode user agent'),
  browserUserAgentWinDesktopModeCustom: z.string().default('').describe('Custom user agent string for Windows desktop mode'),
  browserUserAgentWinTouchMode: z.number().int().default(0).describe('Integer representing the Windows touch mode user agent'),
  browserUserAgentWinTouchModeCustom: z.string().default('').describe('Custom user agent string for Windows touch mode'),
  browserUserAgentWinTouchModeIPad: z.string().default('').describe('iPad-specific user agent string for Windows touch mode'),
  browserUserAgentiOS: z.number().int().default(0).describe('Integer representing the iOS user agent mode'),
  browserUserAgentiOSCustom: z.string().default('').describe('Custom user agent string for iOS'),
  
  // Media and content handling
  browserMediaAutoplay: z.boolean().default(false).describe('Boolean indicating if media autoplay is allowed'),
  browserMediaAutoplayAudio: z.boolean().default(false).describe('Boolean indicating if audio autoplay is allowed'),
  browserMediaAutoplayVideo: z.boolean().default(false).describe('Boolean indicating if video autoplay is allowed'),
  browserMediaCaptureCamera: z.boolean().default(false).describe('Boolean indicating if camera capture is allowed'),
  browserMediaCaptureMicrophone: z.boolean().default(false).describe('Boolean indicating if microphone capture is allowed'),
  browserMediaCaptureScreen: z.boolean().default(false).describe('Boolean indicating if screen capture is allowed'),
  
  // ==================================================================================
  // ZOOM AND DISPLAY SETTINGS
  // ==================================================================================
  
  // Page and text zoom
  enableZoomPage: z.boolean().default(true).describe('Boolean indicating if pages can be zoomed'),
  enableZoomText: z.boolean().default(true).describe('Boolean indicating if text in browser windows can be zoomed'),
  zoomMode: z.number().int().min(0).max(2).default(0).describe('Integer with a value representing one of the SEBZoomModes: 0=Page, 1=Text'),
  defaultPageZoomLevel: z.number().default(1).describe('Default zoom level for pages'),
  defaultTextZoomLevel: z.number().default(1).describe('Default zoom level for text'),
  
  // ==================================================================================
  // MEDIA CAPTURE AND PERMISSIONS
  // ==================================================================================
  
  // Audio and video capture
  allowAudioCapture: z.boolean().default(false).describe('Boolean indicating if web applications are allowed to access the default microphone (using HTML 5 APIs)'),
  allowVideoCapture: z.boolean().default(false).describe('Boolean indicating if web applications are allowed to access the default camera (using HTML 5 APIs)'),
  
  // ==================================================================================
  // NETWORK AND URL FILTERING
  // ==================================================================================
  
  // URL filtering
  URLFilterEnable: z.boolean().default(false).describe('Boolean indicating if URLs are filtered using the URLFilterRules dictionary'),
  URLFilterEnableContentFilter: z.boolean().default(false).describe('Boolean indicating if not only URLs are filtered, but also all embedded resources'),
  URLFilterRules: z.array(urlFilterRuleSchema).default([]).describe('Array of dictionaries each containing a set of URL filter rules'),
  blacklistURLFilter: z.string().default('').describe('URL blacklist filter rules'),
  
  // Network settings
  allowWlan: z.boolean().default(false).describe('Boolean indicating if the WLAN control should be displayed in the SEB task bar'),
  
  // Proxy settings
  proxySettingsPolicy: z.number().int().min(0).max(1).default(0).describe('Integer with a value representing one of the proxySettingsPolicies: 0=useSystemProxySettings, 1=useSEBProxySettings'),

  
  // ==================================================================================
  // AUDIO SETTINGS
  // ==================================================================================
  
  audioControlEnabled: z.boolean().default(false).describe('Boolean indicating if the audio control should be displayed in the SEB task bar'),
  audioMute: z.boolean().default(false).describe('Boolean indicating if audio should be muted when the SEB session is started'),
  audioSetVolumeLevel: z.boolean().default(false).describe('Boolean indicating if the audio volume level should be set to the value of audioVolumeLevel when the SEB session is started'),
  audioVolumeLevel: z.number().int().min(0).max(100).default(25).describe('Integer indicating the initial audio level (in percent) when the SEB session is started'),
  
  // ==================================================================================
  // SECURITY AND SYSTEM SETTINGS
  // ==================================================================================
  
  // macOS and iOS specific security
  allowScreenSharing: z.boolean().default(false).describe('Boolean indicating if macOS network screen sharing (VNC based) and Windows remote session (RDP) is allowed to be used'),
  allowDisplayMirroring: z.boolean().default(false).describe('Boolean indicating if mirroring the main display to another (for example an AirPlay Display) should be allowed'),
  allowSiri: z.boolean().default(false).describe('Boolean indicating if Siri is allowed to be used'),
  allowDictation: z.boolean().default(false).describe('Boolean indicating if it is allowed to use dictation (speech-to-text)'),
  allowAirPlay: z.boolean().default(false).describe('Boolean indicating if AirPlay is allowed'),
  
  // System and application control
  allowSwitchToApplications: z.boolean().default(false).describe('Boolean indicating if users are allowed to switch to permitted applications'),
  allowUserSwitching: z.boolean().default(false).describe('Boolean indicating if fast user switching is allowed'),
  allowVirtualMachine: z.boolean().default(false).describe('Boolean indicating if SEB is allowed to run on a virtual machine or not'),
  
  // Security policies
  sebServicePolicy: z.number().int().min(0).max(2).default(0).describe('Integer with a value representing one of the sebServicePolicies: 0=ignoreService, 1=indicateMissingService, 2=forceSebService'),
  detectStoppedProcess: z.boolean().default(true).describe('Boolean indicating that it should be detected if the SEB process is stopped'),
  enableAppSwitcherCheck: z.boolean().default(true).describe('Boolean indicating whether SEB checks for the command key being held down while SEB is starting up'),
  forceAppFolderInstall: z.boolean().default(true).describe('Boolean indicating if SEB enforces to be installed in an Applications folder'),
  allowUserAppFolderInstall: z.boolean().default(false).describe('Boolean indicating if SEB is allowed to be installed in user-specific application folders'),
  
  // Certificate and encryption
  pinEmbeddedCertificates: z.boolean().default(false).describe('Boolean indicating if the certificate store should not be used to evaluate the validity of a server certificate'),
  embeddedCertificates: z.array(z.string()).default([]).describe('Array of embedded certificates'),
  
  // Platform version requirements
  allowMacOSVersionNumberCheckFull: z.boolean().default(false).describe('Boolean indicating if full macOS version number checking is allowed'),
  allowMacOSVersionNumberMajor: z.number().int().default(0).describe('Major version number for allowed macOS versions'),
  allowMacOSVersionNumberMinor: z.number().int().default(0).describe('Minor version number for allowed macOS versions'),
  allowMacOSVersionNumberPatch: z.number().int().default(0).describe('Patch version number for allowed macOS versions'),
  allowiOSBetaVersionNumber: z.number().int().default(0).describe('Allowed iOS beta version number'),
  allowiOSVersionNumberMajor: z.number().int().default(0).describe('Major version number for allowed iOS versions'),
  allowiOSVersionNumberMinor: z.number().int().default(0).describe('Minor version number for allowed iOS versions'),
  allowiOSVersionNumberPatch: z.number().int().default(0).describe('Patch version number for allowed iOS versions'),
  minMacOSVersion: z.number().int().default(0).describe('Minimum required macOS version'),
  
  // Windows specific security
  createNewDesktop: z.boolean().default(true).describe('Boolean indicating if SEB should be executed in a newly created desktop window'),
  killExplorerShell: z.boolean().default(false).describe('Boolean indicating if the Windows Explorer Shell should be killed when starting SEB'),

  
  // ==================================================================================
  // DOWNLOADS AND FILE HANDLING
  // ==================================================================================
  
  // Download permissions
  allowDownUploads: z.boolean().default(false).describe('Boolean indicating if downloading and uploading files is allowed'),
  allowDownloads: z.boolean().default(false).describe('Boolean indicating if downloading files is allowed'),
  allowUploads: z.boolean().default(false).describe('Boolean indicating if uploading files is allowed'),
  allowUploadsiOS: z.boolean().default(false).describe('Boolean indicating if uploading files is allowed on iOS'),
  allowCustomDownUploadLocation: z.boolean().default(false).describe('Boolean indicating if custom download/upload locations are allowed'),
  
  // Download directories
  downloadDirectoryOSX: z.string().default('').describe('String representing the path of the directory to which downloaded files will be saved (Mac)'),
  downloadDirectoryWin: z.string().default('').describe('String representing the path of the directory to which downloaded files will be saved (Windows)'),
  
  // Download behavior
  openDownloads: z.boolean().default(false).describe('Boolean indicating if downloaded files will be opened with the according application'),
  downloadAndOpenSebConfig: z.boolean().default(true).describe('Boolean indicating if .seb config files should be downloaded and opened, regardless if downloading and opening of other file types is allowed or not'),
  downloadPDFFiles: z.boolean().default(false).describe('Boolean indicating if PDF files should be downloaded or displayed online inside the browser window'),
  allowPDFReaderToolbar: z.boolean().default(false).describe('Boolean indicating whether the toolbar of the internal PDF reader is enabled'),
  chooseFileToUploadPolicy: z.number().int().default(0).describe('Integer representing the policy for choosing files to upload'),
  downloadFileTypes: z.array(z.string()).default([]).describe('Array of allowed file types for downloads'),
  
  // File access permissions
  allowOpenAndSavePanel: z.boolean().default(false).describe('Boolean indicating if open and save panels are allowed'),
  allowPrint: z.boolean().default(false).describe('Boolean indicating if printing is allowed'),
  allowScreenCapture: z.boolean().default(false).describe('Boolean indicating if screen capture is allowed'),
  allowShareSheet: z.boolean().default(false).describe('Boolean indicating if share sheets are allowed'),
  allowWindowCapture: z.boolean().default(false).describe('Boolean indicating if window capture is allowed'),

  
  // ==================================================================================
  // LOGGING AND MONITORING
  // ==================================================================================
  
  // Application monitoring
  allowApplicationLog: z.boolean().default(false).describe('Boolean indicating whether any log information is accessible via the user interface'),
  enableLogging: z.boolean().default(false).describe('Boolean indicating if SEB writes a log'),
  logLevel: z.int().default(0).describe('SEBLogLevelError = 0, SEBLogLevelWarning = 1, SEBLogLevelInfo = 2, SEBLogLevelDebug = 3, SEBLogLevelVerbose = 4'),
  logDirectoryOSX: z.string().default('').describe('String representing the path of the directory to which log files will be saved (Mac)'),
  logDirectoryWin: z.string().default('').describe('String representing the Windows formatted path of the directory to which log files will be saved'),
  logSendingRequiresAdminPassword: z.boolean().default(false).describe('Boolean indicating if sending logs requires admin password'),
  
  // Process monitoring
  monitorProcesses: z.boolean().default(true).describe('Boolean indicating if SEB is monitoring which processes (and applications) are running during an exam'),
  
  // ==================================================================================
  // BROWSER EXAM KEY AND SECURITY
  // ==================================================================================
  
  // Browser Exam Key settings
  sendBrowserExamKey: z.boolean().default(true).describe('Boolean indicating if the Browser Exam Key (BEK) and Config Key (CK) should be sent in a custom HTTP request header'),
  browserExamKeySalt: z.boolean().default(true).describe('Boolean indicating if a salt should be used for the Browser Exam Key'),
  browserURLSalt: z.boolean().default(true).describe('Boolean instructing the browser whether it should use the full URL of a HTTP request as salt when generating the Browser Exam Key request header field'),
  examKeySalt: z.instanceof(Buffer).default(Buffer.alloc(0)).describe('Data representing a random salt value which is used to generate the browser exam key'),
  configKeySalt: z.instanceof(Buffer).default(Buffer.alloc(0)).describe('Data representing a random salt value which is used to increase the entropy of the Config Key'),
  
  // ==================================================================================
  // DISPLAY AND ACCESSIBILITY
  // ==================================================================================
  
  // Display settings
  allowedDisplaysMaxNumber: z.number().int().min(1).default(1).describe('Integer value indicating the maximum allowed number of connected displays'),
  allowedDisplayBuiltin: z.boolean().default(true).describe('Boolean indicating if the built-in display should be used when only one display is allowed'),
  allowedDisplayBuiltinEnforce: z.boolean().default(false).describe('Boolean indicating if the built-in display should be enforced'),
  allowedDisplayBuiltinExceptDesktop: z.boolean().default(false).describe('Boolean indicating if built-in display is allowed except for desktop'),
  allowedDisplaysIgnoreFailure: z.boolean().default(false).describe('Boolean indicating if display configuration failures should be ignored'),
  displayAlwaysOn: z.boolean().default(false).describe('Boolean indicating if the display should always stay on'),
  
  // Battery and power management
  batteryChargeThresholdCritical: z.number().default(0.1).describe('Critical battery charge threshold'),
  batteryChargeThresholdLow: z.number().default(0.2).describe('Low battery charge threshold'),
  
  // Accessibility features
  accessibilityFeatureAssistiveTouch: z.number().int().default(0).describe('Assistive touch accessibility feature setting'),
  accessibilityFeatureGrayscaleDisplay: z.number().int().default(0).describe('Grayscale display accessibility feature setting'),
  accessibilityFeatureInvertColors: z.number().int().default(0).describe('Invert colors accessibility feature setting'),
  accessibilityFeatureVoiceOver: z.number().int().default(0).describe('VoiceOver accessibility feature setting'),
  accessibilityFeatureZoom: z.number().int().default(0).describe('Zoom accessibility feature setting'),

  // ==================================================================================
  // PROCTORING AND AI MONITORING
  // ==================================================================================
  
  // Proctoring AI settings
  proctoringAIEnable: z.boolean().default(false).describe('Boolean indicating if AI-based proctoring is enabled'),
  proctoringDetectFaceAngleDisplay: z.boolean().default(false).describe('Boolean indicating if face angle detection should be displayed'),
  proctoringDetectFaceCount: z.boolean().default(false).describe('Boolean indicating if face count detection is enabled'),
  proctoringDetectFaceCountDisplay: z.boolean().default(false).describe('Boolean indicating if face count detection should be displayed'),
  proctoringDetectFacePitch: z.boolean().default(false).describe('Boolean indicating if face pitch detection is enabled'),
  proctoringDetectFaceYaw: z.boolean().default(false).describe('Boolean indicating if face yaw detection is enabled'),
  proctoringDetectTalking: z.boolean().default(false).describe('Boolean indicating if talking detection is enabled'),
  proctoringDetectTalkingDisplay: z.boolean().default(false).describe('Boolean indicating if talking detection should be displayed'),
  enableScreenProctoring: z.boolean().default(false).describe('Boolean indicating if screen-based proctoring is enabled'),
  
  // ==================================================================================
  // APPLICATIONS AND PROCESSES
  // ==================================================================================
  
  // Resource management
  additionalResources: z.array(additionalResourceSchema).default([]).describe('Array of additionalResource dictionaries containing additional resources which can be used during an exam'),
  prohibitedProcesses: z.array(processSchema).default([]).describe('Array of dictionaries which contain the properties of processes which are prohibited to run during an exam'),
  permittedProcesses: z.array(permittedProcessSchema).default([]).describe('Array of dictionaries containing the properties of permitted third party applications and processes'),
  
  // Auto-start behavior
  autoQuitApplications: z.boolean().default(false).describe('Boolean indicating if applications should be automatically quit'),
  
  // ==================================================================================
  // KEYBOARD AND MOUSE CONTROL
  // ==================================================================================
  
  // Function keys
  enableF1: z.boolean().default(false).describe('Boolean indicating if the F1 key is enabled'),
  enableF2: z.boolean().default(false).describe('Boolean indicating if the F2 key is enabled'),
  enableF3: z.boolean().default(false).describe('Boolean indicating if the F3 key is enabled'),
  enableF4: z.boolean().default(false).describe('Boolean indicating if the F4 key is enabled'),
  enableF5: z.boolean().default(false).describe('Boolean indicating if the F5 key is enabled'),
  enableF6: z.boolean().default(false).describe('Boolean indicating if the F6 key is enabled'),
  enableF7: z.boolean().default(false).describe('Boolean indicating if the F7 key is enabled'),
  enableF8: z.boolean().default(false).describe('Boolean indicating if the F8 key is enabled'),
  enableF9: z.boolean().default(false).describe('Boolean indicating if the F9 key is enabled'),
  enableF10: z.boolean().default(false).describe('Boolean indicating if the F10 key is enabled'),
  enableF11: z.boolean().default(false).describe('Boolean indicating if the F11 key is enabled'),
  enableF12: z.boolean().default(false).describe('Boolean indicating if the F12 key is enabled'),
  
  // Special key combinations
  enableAltEsc: z.boolean().default(false).describe('Boolean indicating if Alt+Esc key combination is enabled'),
  enableAltF4: z.boolean().default(false).describe('Boolean indicating if Alt+F4 key combination is enabled'),
  enableAltMouseWheel: z.boolean().default(false).describe('Boolean indicating if Alt+MouseWheel is enabled'),
  enableCtrlEsc: z.boolean().default(false).describe('Boolean indicating if Ctrl+Esc key combination is enabled'),
  enableEsc: z.boolean().default(false).describe('Boolean indicating if the Escape key is enabled'),
  enablePrintScreen: z.boolean().default(false).describe('Boolean indicating if the Print Screen key is enabled'),
  enableScrollLock: z.boolean().default(false).describe('Boolean indicating if the Scroll Lock key is enabled'),
  enableStartMenu: z.boolean().default(false).describe('Boolean indicating if the Start Menu is enabled'),
  
  // Exit key configuration
  exitKey1: z.number().int().default(0).describe('First exit key code'),
  exitKey2: z.number().int().default(0).describe('Second exit key code'),
  exitKey3: z.number().int().default(0).describe('Third exit key code'),
  hookKeys: z.boolean().default(false).describe('Boolean indicating if key hooking is enabled'),
  
  // Mouse controls
  enableMiddleMouse: z.boolean().default(false).describe('Boolean indicating if the middle mouse button is enabled'),
  enableRightMouse: z.boolean().default(false).describe('Boolean indicating if the right mouse button is enabled'),
  enableRightMouseMac: z.boolean().default(false).describe('Boolean indicating if the right mouse button is enabled on macOS'),
  
  // ==================================================================================
  // MOBILE AND TOUCH SPECIFIC SETTINGS
  // ==================================================================================
  
  // iOS and mobile settings
  mobileAllowInlineMediaPlayback: z.boolean().default(false).describe('Boolean indicating if inline media playback is allowed on mobile'),
  mobileAllowPictureInPictureMediaPlayback: z.boolean().default(false).describe('Boolean indicating if picture-in-picture media playback is allowed on mobile'),
  mobileAllowQRCodeConfig: z.boolean().default(false).describe('Boolean indicating if QR code configuration is allowed on mobile'),
  mobileAllowSingleAppMode: z.boolean().default(false).describe('Boolean indicating if single app mode is allowed on mobile'),
  mobileCompactAllowInlineMediaPlayback: z.boolean().default(false).describe('Boolean indicating if inline media playback is allowed on compact mobile devices'),
  mobileEnableASAM: z.boolean().default(false).describe('Boolean indicating if ASAM (Automated Secure Assessment Mode) is enabled on mobile'),
  mobileEnableGuidedAccessLinkTransform: z.boolean().default(false).describe('Boolean indicating if guided access link transformation is enabled on mobile'),
  mobileEnableModernAAC: z.boolean().default(false).describe('Boolean indicating if modern AAC is enabled on mobile'),
  mobilePreventAutoLock: z.boolean().default(false).describe('Boolean indicating if auto-lock should be prevented on mobile'),
  mobileShowEditConfigShortcutItem: z.boolean().default(false).describe('Boolean indicating if edit config shortcut item should be shown on mobile'),
  mobileShowSettings: z.boolean().default(false).describe('Boolean indicating if settings should be shown on mobile'),
  mobileSleepModeLockScreen: z.boolean().default(false).describe('Boolean indicating if sleep mode should lock the screen on mobile'),
  mobileStatusBarAppearance: z.number().int().default(0).describe('Integer representing the status bar appearance on mobile'),
  mobileStatusBarAppearanceExtended: z.number().int().default(0).describe('Integer representing the extended status bar appearance on mobile'),
  
  // Form factor and orientation support
  mobileSupportedFormFactorsCompact: z.boolean().default(false).describe('Boolean indicating if compact form factors are supported on mobile'),
  mobileSupportedFormFactorsNonTelephonyCompact: z.boolean().default(false).describe('Boolean indicating if non-telephony compact form factors are supported on mobile'),
  mobileSupportedFormFactorsRegular: z.boolean().default(false).describe('Boolean indicating if regular form factors are supported on mobile'),
  mobileSupportedScreenOrientationsCompactLandscapeLeft: z.boolean().default(false).describe('Boolean indicating if compact landscape left orientation is supported'),
  mobileSupportedScreenOrientationsCompactLandscapeRight: z.boolean().default(false).describe('Boolean indicating if compact landscape right orientation is supported'),
  mobileSupportedScreenOrientationsCompactPortrait: z.boolean().default(false).describe('Boolean indicating if compact portrait orientation is supported'),
  mobileSupportedScreenOrientationsCompactPortraitUpsideDown: z.boolean().default(false).describe('Boolean indicating if compact portrait upside down orientation is supported'),
  mobileSupportedScreenOrientationsRegularLandscapeLeft: z.boolean().default(false).describe('Boolean indicating if regular landscape left orientation is supported'),
  mobileSupportedScreenOrientationsRegularLandscapeRight: z.boolean().default(false).describe('Boolean indicating if regular landscape right orientation is supported'),
  mobileSupportedScreenOrientationsRegularPortrait: z.boolean().default(false).describe('Boolean indicating if regular portrait orientation is supported'),
  mobileSupportedScreenOrientationsRegularPortraitUpsideDown: z.boolean().default(false).describe('Boolean indicating if regular portrait upside down orientation is supported'),
  
  // ==================================================================================
  // COMMUNICATION AND MESSAGING
  // ==================================================================================
  
  // Browser messaging and communication
  browserMessagingSocket: z.string().optional().describe('String containing a service URL for the socket server'),
  browserMessagingSocketEnabled: z.boolean().default(false).describe('Boolean indicating if browser messaging socket is enabled'),
  browserMessagingPingTime: z.number().int().default(0).describe('Integer representing the ping time for browser messaging in milliseconds'),
  
  // ==================================================================================
  // JITSI MEET INTEGRATION
  // ==================================================================================
  
  // Jitsi Meet core settings
  jitsiMeetEnable: z.boolean().default(false).describe('Enable Jitsi Meet integration'),
  jitsiMeetServerURL: z.string().default('').describe('Jitsi Meet server URL'),
  jitsiMeetRoom: z.string().default('').describe('Jitsi Meet room name'),
  jitsiMeetSubject: z.string().default('').describe('Jitsi Meet subject'),
  jitsiMeetToken: z.string().default('').describe('Jitsi Meet token'),
  
  // Jitsi Meet feature flags
  jitsiMeetFeatureFlagChat: z.boolean().default(false).describe('Enable Jitsi Meet chat feature'),
  jitsiMeetFeatureFlagCloseCaptions: z.boolean().default(false).describe('Enable Jitsi Meet close captions feature'),
  jitsiMeetFeatureFlagDisplayMeetingName: z.boolean().default(false).describe('Enable Jitsi Meet display meeting name feature'),
  jitsiMeetFeatureFlagRaiseHand: z.boolean().default(false).describe('Enable Jitsi Meet raise hand feature'),
  jitsiMeetFeatureFlagRecording: z.boolean().default(false).describe('Enable Jitsi Meet recording feature'),
  jitsiMeetFeatureFlagTileView: z.boolean().default(false).describe('Enable Jitsi Meet tile view feature'),
  
  // Jitsi Meet audio/video settings
  jitsiMeetAudioMuted: z.boolean().default(false).describe('Jitsi Meet audio muted'),
  jitsiMeetAudioOnly: z.boolean().default(false).describe('Jitsi Meet audio only mode'),
  jitsiMeetReceiveAudio: z.boolean().default(false).describe('Jitsi Meet receive audio'),
  jitsiMeetReceiveVideo: z.boolean().default(false).describe('Jitsi Meet receive video'),
  jitsiMeetSendAudio: z.boolean().default(false).describe('Jitsi Meet send audio'),
  jitsiMeetSendVideo: z.boolean().default(false).describe('Jitsi Meet send video'),
  jitsiMeetVideoMuted: z.boolean().default(false).describe('Jitsi Meet video muted'),
  
  // Jitsi Meet user information
  jitsiMeetUserInfoAvatarURL: z.string().default('').describe('Jitsi Meet user info avatar URL'),
  jitsiMeetUserInfoDisplayName: z.string().default('').describe('Jitsi Meet user info display name'),
  jitsiMeetUserInfoEMail: z.string().default('').describe('Jitsi Meet user info email'),
  
  // ==================================================================================
  // EXAM SESSION MANAGEMENT
  // ==================================================================================
  
  // Session behavior
  examSessionClearCookiesOnEnd: z.boolean().default(true).describe('Boolean indicating if session cookies should be cleared when ending the current exam session'),
  examSessionClearCookiesOnStart: z.boolean().default(true).describe('Boolean indicating if session cookies should be cleared when starting the current exam session'),
  examSessionReconfigureAllow: z.boolean().default(false).describe('Boolean indicating if reconfiguration is allowed during the exam session'),
  examSessionReconfigureConfigURL: z.string().default('').describe('URL for exam session reconfiguration'),
  
  // ==================================================================================
  // WINDOWS SPECIFIC SETTINGS
  // ==================================================================================
  
  // Windows system control
  disableSessionChangeLockScreen: z.boolean().default(false).describe('Boolean indicating if session change lock screen should be disabled'),
  enableWindowsUpdate: z.boolean().default(false).describe('Boolean indicating if Windows Update is enabled'),
  
  // Inside SEB Windows controls
  insideSebEnableChangeAPassword: z.boolean().default(false).describe('Boolean indicating if changing password is enabled inside SEB'),
  insideSebEnableEaseOfAccess: z.boolean().default(false).describe('Boolean indicating if ease of access is enabled inside SEB'),
  insideSebEnableLockThisComputer: z.boolean().default(false).describe('Boolean indicating if locking the computer is enabled inside SEB'),
  insideSebEnableLogOff: z.boolean().default(false).describe('Boolean indicating if logging off is enabled inside SEB'),
  insideSebEnableNetworkConnectionSelector: z.boolean().default(false).describe('Boolean indicating if network connection selector is enabled inside SEB'),
  insideSebEnableShutDown: z.boolean().default(false).describe('Boolean indicating if shutdown is enabled inside SEB'),
  insideSebEnableStartTaskManager: z.boolean().default(false).describe('Boolean indicating if starting task manager is enabled inside SEB'),
  insideSebEnableSwitchUser: z.boolean().default(false).describe('Boolean indicating if switching user is enabled inside SEB'),
  insideSebEnableVmWareClientShade: z.boolean().default(false).describe('Boolean indicating if VMware client shade is enabled inside SEB'),
  
  // ==================================================================================
  // ADDITIONAL DEVELOPER AND TESTING SETTINGS
  // ==================================================================================
  
  // Developer tools
  allowDeveloperConsole: z.boolean().default(false).describe('Boolean indicating if developer console is allowed'),
  enableDrawingEditor: z.boolean().default(false).describe('Boolean indicating if drawing editor is enabled'),
  enableFindPrinter: z.boolean().default(false).describe('Boolean indicating if find printer functionality is enabled'),
  enableCursorVerification: z.boolean().default(false).describe('Boolean indicating if cursor verification is enabled'),
  
  // Chrome and browser specific
  enableChromeNotifications: z.boolean().default(false).describe('Boolean indicating if Chrome notifications are enabled'),
  
  // Security testing and validation
  blockScreenShotsLegacy: z.boolean().default(false).describe('Boolean indicating if legacy screen shots should be blocked'),
  aacDnsPrePinning: z.boolean().default(false).describe('Boolean indicating if AAC DNS pre-pinning is enabled'),
  
  // Configuration and identity
  configFileCreateIdentity: z.boolean().default(false).describe('Boolean indicating if config file should create identity'),
  configFileEncryptUsingIdentity: z.boolean().default(false).describe('Boolean indicating if config file should be encrypted using identity'),
  backgroundOpenSEBConfig: z.boolean().default(false).describe('Boolean indicating if SEB config should be opened in background'),
  
  // Clipboard policy
  clipboardPolicy: z.number().int().default(0).describe('Integer representing the clipboard policy'),
  
  // ==================================================================================
  // VERSION AND METADATA
  // ==================================================================================
  
  // Version information
  originatorVersion: z.string().default('3.7.0').describe('Version information about the SEB application which saved the configuration file'),

  /* required,partial hack to not apply defaults */
  /* see https://github.com/colinhacks/zod/issues/5235 */
}).required().partial().strict();

export type SEBConfig = z.infer<typeof sebConfigSchema>;
export type URLFilterRule = z.infer<typeof urlFilterRuleSchema>;
export type AdditionalResource = z.infer<typeof additionalResourceSchema>;
export type Process = z.infer<typeof processSchema>;
export type PermittedProcess = z.infer<typeof permittedProcessSchema>;
