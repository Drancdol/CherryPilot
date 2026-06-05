import { reactive } from 'vue';
import { GUIDE_LANGUAGE_KEY, PROVIDERS } from '@/renderer/entity';
import { normalizeGuideLanguage, textFor } from '@/renderer/composables/companionText';

// 鍒濆鍖栧紩瀵艰瑷€锛宭ocalStorage 涓嶅彲鐢ㄦ椂鍥為€€涓枃銆?
function initialGuideLanguage() {
  try {
    return normalizeGuideLanguage(localStorage.getItem(GUIDE_LANGUAGE_KEY));
  } catch {
    return 'zh';
  }
}

// 鍘嗗彶璁板綍鏉＄洰锛屼緵鍘嗗彶闈㈡澘鍜屾湰鍦版寔涔呭寲澶嶇敤銆?
export interface HistoryEntry {
  id: string;
  askedAt: string;
  question?: string;
  answer?: string;
  model?: string;
  hasImage?: boolean;
  imageUrl?: string;
  attachmentCount?: number;
}

// 闄勪欢鏉＄洰娌跨敤 preload bridge 鐨勯檮浠剁被鍨嬶紝閬垮厤 renderer 閲嶅澹版槑缁撴瀯銆?
export type AttachmentItem = CompanionAttachmentItem;

// 鎮诞绐楁嫋鎷借繃绋嬩腑鐨勬寚閽堢姸鎬併€?
interface CompactDragState {
  pointerId: number;
  startX: number;
  startY: number;
  distance: number;
  started: boolean;
}

// renderer 鍏变韩鐘舵€侊紝鎵€鏈夌粍浠跺拰 composable 閮戒粠杩欓噷璇诲啓鐣岄潰鐘舵€併€?
export const companionState = reactive({
  // 褰撳墠澶栭儴绐楀彛涓婁笅鏂囧拰鎴浘/闄勪欢涓婁笅鏂囥€?
  activeContext: { title: '', checkedAt: null as string | null },
  screenshotDataUrl: '',
  screenshotPreviewOpen: false,
  attachments: [] as AttachmentItem[],
  // 妯″瀷鎺ュ彛閰嶇疆鍜屽悇鎺ュ彛宸叉媺鍙栫殑妯″瀷鍒楄〃銆?
  modelLists: PROVIDERS.map(() => [] as string[]),
  providers: PROVIDERS.map((provider) => ({
    ...provider,
    apiKey: '',
    baseUrl: provider.defaultBaseUrl,
    model: provider.defaultModel,
    menuOpen: false,
    isRefreshing: false
  })),
  activeProviderIndex: 0,
  // 鍘嗗彶璁板綍銆佷富棰樺拰寮曞璇█銆?
  history: [] as HistoryEntry[],
  theme: 'dark' as 'dark' | 'light',
  guideLanguage: initialGuideLanguage(),
  // 杩愯閰嶇疆锛氭€ц兘妯″紡銆佺數鑴戞潈闄愩€佸紑鏈哄惎鍔ㄥ拰 LAN 鍒嗕韩銆?
  lowCpuMode: true,
  computerAccess: {
    enabled: false,
    workspaceRoot: '',
    allowCommands: false
  },
  startupOpenAtLogin: false,
  lanShare: {
    enabled: false,
    port: 0,
    token: '',
    urls: [] as string[]
  },
  // 鍥炵瓟鍖哄拰鎮诞杈撳叆鐨勬樉绀虹姸鎬併€?
  statusText: '',
  answerContent: '',
  answerPending: false,
  answerImageUrl: '',
  compactPrompt: '',
  compactModelPanelOpen: false,
  compactModelPanelMessage: '',
  compactModelLoading: false,
  compactHistoryPanelOpen: false,
  // 璇煶杈撳叆鐩稿叧鐘舵€佸拰褰曢煶鍒嗘瀹氭椂鍣ㄣ€?
  isRecording: false,
  voiceProcessing: false,
  mediaRecorder: null as MediaRecorder | null,
  voiceStream: null as MediaStream | null,
  voiceChunks: [] as Blob[],
  voiceAwake: false,
  voiceSegmentTimer: null as ReturnType<typeof setTimeout> | null,
  voiceRestartTimer: null as ReturnType<typeof setTimeout> | null,
  voiceMimeType: '',
  // 涓荤獥鍙?鎮诞绐楁ā寮忛暅鍍忥紝瀹為檯绐楀彛杈圭晫鐢变富杩涚▼缁存姢銆?
  windowMode: 'expanded',
  dockSide: 'right',
  revealed: false,
  docked: false,
  answerZoomed: false,
  contextMenuOpen: false,
  isBusy: false,
  pointerInWindow: false,
  // 鎮诞鐞冩嫋鎷姐€佺偣鍑诲拰鑷姩鏀惰捣鐘舵€併€?
  compactDrag: null as CompactDragState | null,
  compactDragFrame: null as number | null,
  compactDragPoint: null as CompanionPoint | null,
  agentTapTimer: null as ReturnType<typeof setTimeout> | null,
  lastAgentTapAt: 0,
  dragDepth: 0,
  dragging: false,
  autoCompactTimer: null as ReturnType<typeof setTimeout> | null,
  mainLockedOpen: true
});

export type ProviderState = typeof companionState.providers[number];

// 缁熶竴鍒囨崲鐣岄潰蹇欑鐘舵€併€?
export function setBusy(value: boolean) {
  companionState.isBusy = value;
}

// 鏇存柊搴曢儴/璁剧疆闈㈡澘鍙鐢ㄧ殑鐘舵€佹彁绀烘枃妗堛€?
export function setStatusText(message: string) {
  companionState.statusText = message;
}

// 鏇存柊鎮诞鍥炵瓟鍐呭锛屽彲闄勫甫 pending 鐘舵€佸拰鐢熷浘缁撴灉銆?
export function setCompactAnswer(content: string, pending = false, imageUrl = '') {
  companionState.answerContent = content || textFor(companionState.guideLanguage, 'waitingQuestion');
  companionState.answerPending = pending;
  companionState.answerImageUrl = imageUrl;
}




