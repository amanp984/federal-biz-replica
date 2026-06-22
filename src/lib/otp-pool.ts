const OTP_POOL: string[] = [
  "583921","104786","729415","361908","845273","217694","930561","472185","658309","191742",
  "804615","537928","260471","918354","743206","125893","689470","352814","976531","408267",
  "713590","284761","867345","140928","625783","391654","758219","206437","981562","473890",
  "152647","839201","564718","297435","906182","431759","785024","163948","648271","325806",
  "894173","210569","537461","762815","184392","953706","426185","671249","308574","845920",
  "172638","590741","263815","917420","684531","341796","758642","105387","892614","476053",
  "231784","968251","540927","817463","392158","674820","129573","845316","507284","263941",
  "798635","410782","156294","927510","683147","245869","870421","314658","591273","762904",
  "183547","950261","427893","601758","734182","298640","815379","462015","973824","140675",
  "586312","720948","351627","894560","216483","647291","905134","378562","741809","528476",
];

// Bumped after pool replacement so previously-used codes do not block the new pool.
const STORAGE_KEY = "fedbusiness_used_otps_v2";

function readUsed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeUsed(used: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(used));
  } catch {
    /* ignore */
  }
}

export const OTP_ERROR_MESSAGE =
  "The OTP entered is not valid. Kindly enter a valid OTP.";

/**
 * Try to consume an OTP from the fixed pool.
 * Returns null on success, or an error message string on failure.
 * Once all 100 OTPs have been consumed, the pool automatically resets.
 */
export function consumeOtp(otp: string): string | null {
  if (!OTP_POOL.includes(otp)) return OTP_ERROR_MESSAGE;
  let used = readUsed();
  if (used.includes(otp)) return OTP_ERROR_MESSAGE;
  used = [...used, otp];
  // Auto-reset when the full cycle is complete.
  if (used.length >= OTP_POOL.length) {
    writeUsed([]);
  } else {
    writeUsed(used);
  }
  return null;
}