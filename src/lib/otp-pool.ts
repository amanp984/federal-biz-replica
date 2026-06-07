const OTP_POOL: string[] = [
  "482917","105834","763291","594028","218475","836102","471859","692347","150928","784613",
  "329570","615284","908341","247695","531870","864209","173546","420981","756318","291407",
  "638152","845793","102684","579231","314968","687420","923157","456802","781349","205716",
  "648390","912475","357681","724903","180562","593847","841206","276514","639028","104785",
  "758431","320694","875120","461983","207346","694218","531764","802159","347625","918403",
  "260781","745912","183694","627450","590128","814367","235890","769145","401872","658239",
  "927514","314750","582961","143827","806594","271438","639715","950284","417603","728951",
  "185472","604839","351297","892614","240763","715028","963841","428570","157936","684125",
  "309748","871253","526490","194685","738201","460972","825314","213809","647581","980436",
  "372145","754690","108527","691843","245718","837406","512973","176284","703591","948162",
];

const STORAGE_KEY = "fedbusiness_used_otps_v1";

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