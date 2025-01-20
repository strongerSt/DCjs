//Mon Jan 20 2025 05:03:19 GMT+0000 (Coordinated Universal Time)
//Base:https://github.com/echo094/decode-js
//Modify:https://github.com/smallfawn/decode_action
let obj = {};
let ddm = JSON.parse(typeof $response != "undefined" && $response.body || "{}");
const headers = $request.headers;
const ua = headers["User-Agent"] || headers["user-agent"];
const bundle_id = headers["X-Client-Bundle-ID"] || headers["x-client-bundle-id"];
const forbiddenApps = ["Rond", "Fileball", "APTV"];
if (forbiddenApps.some(app => ua && ua.includes(app) || $request.body && $request.body.includes(app))) {
  console.log("⛔️检测到禁止 MITM 的 APP，脚本停止运行！");
  $done({});
}
const bundle = {
  "com.ausoco.umai": {
    name: "umai_pro",
    id: "umai_pro_yearly",
    cm: "sja"
  },
  "camp.user.penbook": {
    name: "pro",
    id: "penbook.lifetime01",
    cm: "sjb"
  },
  "design.yugen.Flow": {
    name: "pro",
    id: "design.yugen.Flow.Lifetime",
    cm: "sja"
  },
  "com.runbuddy.prod": {
    name: "premium",
    id: "rb_9999_1y_1y7999",
    cm: "sja"
  },
  TeleprompterX: {
    name: "Pro Upgrade",
    id: "TPXOTP",
    cm: "sjb"
  },
  "com.exoplanet.chatme": {
    name: "premium",
    id: "chatme_premium_year_trial",
    cm: "sja"
  },
  "com.reku.Counter": {
    name: "plus",
    id: "com.reku.counter.plus.lifetime",
    cm: "sjb"
  },
  "moonbox.co.il.grow": {
    name: "pro",
    id: "moonbox.co.il.grow.lifetime.offer",
    cm: "sjb"
  },
  "tech.miidii.MDClock": {
    name: "Entitlement.Pro",
    id: "tech.miidii.MDClock.pro",
    cm: "sjb"
  },
  "com.voicedream.Voic": {
    name: "standard",
    id: "vd_annual_79_3daytrial",
    cm: "sja"
  },
  "com.laser-focused.focus-ios": {
    name: "subscribed",
    id: "iap.io.masterbuilders.focus.pro_one_year",
    cm: "sja"
  },
  "com.roehl": {
    name: "Pro",
    id: "habitkit_3499_lt",
    cm: "sjb"
  },
  "net.tengl.powertimer": {
    name: "plus",
    id: "powertimer.plus",
    cm: "sjb"
  },
  "com.reader.book": {
    name: "pro",
    id: "reader.lifetimeFamily.pro",
    cm: "sja"
  },
  "app.imone.OneWidget": {
    name: "pro",
    id: "app.imone.OneWidget.Lifetime",
    cm: "sjb"
  },
  "io.innerpeace.yiye": {
    name: "Premium",
    id: "io.innerpeace.yiye.lifetime.forYearly",
    cm: "sja"
  },
  "com.skysoft.removalfree": {
    name: "Pro",
    id: "com.skysoft.removalfree.subscription.newyearly",
    cm: "sja"
  }
};
const listua = {
  Accountit: {
    name: "spenditPlus",
    id: "DesignTech.SIA.Spendit.Plus.Lifetime",
    cm: "sjb"
  },
  "Phtoto%20Swiper": {
    name: "pro",
    id: "rc_499_life",
    cm: "sjb"
  },
  ShellBean: {
    name: "pro",
    id: "com.ningle.shellbean.iap.forever",
    cm: "sjb"
  },
  Wishy: {
    name: "Wishy Subscription",
    id: "wishy_lifetime_subscription",
    cm: "sjc"
  },
  Fontsify: {
    name: "pro",
    id: "media.upstate.fontify.lifetime",
    cm: "sjb"
  },
  "com.dison.diary": {
    name: "vip",
    id: "lifetime",
    cm: "sjb"
  },
  "Food-Diary": {
    name: "Premium",
    id: "fd_lifetime",
    cm: "sjb"
  },
  "Meal%20Planner": {
    name: "premium",
    id: "mp_1999_lifetime",
    cm: "sjc"
  },
  "Medication%20List": {
    name: "Premium",
    id: "ml_lifetime",
    cm: "sjc"
  },
  "Shared%20Family%20Shopping%20List": {
    name: "premium",
    id: "ls_1299_lifetime",
    cm: "sjc"
  },
  "Pantry%20Check": {
    name: "Premium",
    id: "pc_lifetime",
    cm: "sjc"
  },
  becoming: {
    name: "Strength Pro",
    id: "strength_membership_lifetime",
    cm: "sjb"
  },
  SCRL: {
    name: "com.dopedevelopment.Panels.subscription.Pro_Dynamic_Pricing",
    id: "strength_membership_lifetime",
    cm: "sja"
  },
  Morphose: {
    name: "ProStandard",
    id: "com.pixery.morphose.yearly",
    cm: "sja"
  },
  ClevCalc: {
    name: "Premium",
    id: "com.dencreak.dlcalculator.iap.dlc_no_ads_permanent",
    cm: "sjb"
  },
  Unfold: {
    name: "REDUCED_PRO_YEARLY",
    id: "UNFOLD_PRO_YEARLY",
    cm: "sja"
  },
  "Tracepad-iOS": {
    name: "unlock",
    id: "tracepad_unlock_all_gesture_5",
    cm: "sjb"
  },
  photography: {
    name: "premium",
    id: "photography_sub_yearly_1",
    cm: "sja"
  },
  Binsoo: {
    name: "vibe",
    id: "annual",
    cm: "sja"
  },
  "%E8%90%8C%E5%AE%A2AI%E7%BB%98%E7%94%BB": {
    name: "AISticker_VIP",
    id: "LifetimeSubscription_Sticker",
    cm: "sjb"
  },
  "Storage%20Cleaner": {
    name: "Premium",
    id: "storagecleaner_standalone_lifetime_free",
    cm: "sjb"
  },
  "Language%20Learning": {
    name: "premium",
    id: "language_sub_lifetime",
    cm: "sjb"
  },
  OneTap: {
    name: "pro",
    id: "DiscountedProLifetime",
    cm: "sjb"
  },
  ChatPub: {
    name: "Unlimited Access",
    id: "conversationai.annual",
    cm: "sja"
  },
  Jellycuts: {
    name: "pro",
    id: "premium",
    cm: "sja"
  },
  quitnow: {
    name: "pro_features",
    id: "com.eaginsoftware.QuitNow.unlock_all_pro_features",
    cm: "sjb"
  },
  "Ricoh%20Recipes": {
    name: "Patron",
    id: "Ricoh_Patron",
    cm: "sja"
  },
  PixImagine: {
    id: "com.efsoft.piximagine_nc_lifetime",
    cm: "sjc"
  },
  PicLoom: {
    id: "com.efsoft.picloom_nc_lifetime",
    cm: "sjc"
  },
  "Translate%20-%20Talk%20Translator": {
    name: "Premium",
    id: "premiumAnnually",
    cm: "sja"
  },
  Authenticator: {
    name: "premium",
    id: "2fa_standalone_lifetime",
    cm: "sja"
  },
  ChatBot: {
    name: "chatbot_annual",
    id: "chatbot_annual",
    cm: "sja"
  },
  Mockview: {
    name: "Pro",
    id: "kavsoft.dev.yearly",
    cm: "sja"
  },
  ChatLLM: {
    name: "Pro",
    id: "com.curiouscreatorsco.ChatLLM.pro.lifetime.notrial.150_00",
    cm: "sjb"
  },
  Binsoo: {
    name: "vibe",
    id: "annual",
    cm: "sja"
  },
  Photoooo: {
    name: "lifetime",
    id: "canoe_28_rnb_forever",
    cm: "sjb"
  },
  VibeCamera: {
    name: "forever",
    id: "vibe_pro_forever",
    cm: "sjb"
  },
  "No%20Fusion": {
    name: "LivePhoto",
    id: "com.grey.nofusion.livephoto",
    cm: "sjb"
  },
  Themy: {
    name: "fonts_premium",
    id: "lifetime",
    cm: "sjb"
  },
  BabyCare: {
    name: "pro",
    id: "KiddoKeeper_38_LifeTime",
    cm: "sjb"
  },
  ElonAI: {
    name: "premium",
    id: "elongpt.yearly_1",
    cm: "sja"
  },
  "Dumb%20Phone": {
    name: "Pro",
    id: "dp.lifetime_19.99",
    cm: "sjb"
  },
  maple_mobile: {
    name: "premium",
    id: "mc_3000_12m",
    cm: "sja"
  },
  FujiLifeStyle: {
    name: "FUJIStyle Pro(Year)",
    id: "FujiStyle2024003",
    cm: "sja"
  },
  Gentler: {
    name: "premium",
    id: "app.gentler.activity.nonconsumable.onetime1",
    cm: "sjb"
  },
  TuneTally: {
    name: "Pro",
    id: "tunetally_pro",
    cm: "sjb"
  },
  Readle: {
    name: "Premium",
    id: "com.hello.german.yearly",
    cm: "sja"
  },
  Utiful: {
    name: "All Access",
    id: "All_Access_YR_12M_Free",
    cm: "sja"
  },
  CharingCrossRoad: {
    name: "ready_pro",
    id: "ready_pro_50_1y",
    cm: "sja"
  },
  "ig-bookmarker": {
    name: "entitlement",
    id: "lifetimeID",
    cm: "sjb"
  },
  PhotoMapper: {
    name: "premium",
    id: "photomapper_lifetime_1.99",
    cm: "sjb"
  },
  CallAnnie: {
    name: "ai.animato.callannie.entitlement.pro0",
    id: "ai.animato.callannie.proyearly1",
    cm: "sja"
  },
  Liftbear: {
    name: "Pro",
    id: "liftbear_2399_1y",
    cm: "sja"
  },
  OneMockup: {
    name: "pro",
    id: "online.ohwe.onescreen.Lifetime",
    cm: "sja"
  },
  DataCalc: {
    name: "datacalc.pro",
    id: "datacalc.yearly.12",
    cm: "sja"
  },
  "moss-ios": {
    name: "prouser",
    id: "dpbox_yearly_68",
    cm: "sja"
  },
  Law: {
    name: "vip",
    id: "LawVIPOneYear",
    cm: "sja"
  },
  SleepSounds: {
    name: "vip",
    id: "VIPOneMonth",
    cm: "sja"
  },
  multitimer_app: {
    name: "premium",
    id: "timus_lt_base",
    cm: "sjb"
  },
  pdfai_app: {
    name: "premium",
    id: "special_lifetime",
    cm: "sjb"
  },
  "Linearity%20Curve": {
    name: "pro",
    id: "linearity_curve_pro_yearly_free_trial",
    cm: "sja"
  },
  TQBrowser: {
    name: "pro_lt",
    id: "com.tk.client.lifetime",
    cm: "sjb"
  },
  "AI%C2%A0Chat": {
    name: "AI Plus",
    id: "ai_plus_gpt_yearly",
    cm: "sja"
  },
  Yosum: {
    name: "Premium",
    id: "yosum_999_1year",
    cm: "sja"
  },
  "%E8%B5%84%E6%BA%90%E6%90%AC%E8%BF%90%E5%A4%A7%E5%B8%88": {
    name: "SaveTikYoutu_common",
    id: "LifetimeSubscription",
    cm: "sjb"
  },
  DHWaterMarkManager: {
    name: "WaterManager_common",
    id: "lifetimeVIP_001",
    cm: "sjb"
  },
  iplayTV: {
    name: "com.ll.btplayer.12",
    id: "com.ll.btplayer.12",
    cm: "sjb"
  },
  MaxWallpaper: {
    name: "maxwallpaper_common",
    id: "super_forever_vip",
    cm: "sjb"
  },
  intervalFlow: {
    name: "All Access",
    id: "wodtimer_lf",
    cm: "sjb"
  },
  BORD: {
    name: "pro_membership",
    id: "bord_plus_2499_lifetime",
    cm: "sjb"
  },
  FRMD: {
    name: "all_access",
    id: "frmd_plus_999_lifetime",
    cm: "sjb"
  },
  HRZN: {
    name: "pro",
    id: "plus_999_lifetime",
    cm: "sjb"
  },
  Assembly: {
    name: "premium_access",
    id: "com.pixite.assembly.1yearlyq",
    cm: "sja"
  },
  Flourish: {
    name: "Pro",
    id: "flourish_9800_1yr_1m0",
    cm: "sja"
  },
  metaslip: {
    name: "Pro",
    id: "ms_lifetime",
    cm: "sjb"
  },
  Pins: {
    name: "customer",
    id: "do.anh.Pins.Unlock.Standard",
    cm: "sja"
  },
  Loora: {
    name: "Yearly",
    id: "yearly_free_ref_10usd_off",
    cm: "sja"
  },
  PwDrawingPad: {
    name: "pro",
    id: "com.s132.app.supaintexchange.year",
    cm: "sja"
  },
  OneGrow: {
    name: "pro",
    id: "com.onenicetech.OneGrow.Lifetime",
    cm: "sjb"
  },
  "%E6%97%B6%E9%97%B4%E8%AE%B0%E5%BD%95": {
    name: "pro",
    id: "com.bapaws.Hours.lifetime",
    cm: "sjb"
  },
  PianoTrainer: {
    name: "pro_subscription",
    id: "pianotrainer.sub.yearly.pro",
    cm: "sja"
  },
  FretTrainer: {
    name: "pro_subscription",
    id: "frettrainer.sub.yearly.pro",
    cm: "sja"
  },
  Currency: {
    name: "plus",
    id: "com.jeffreygrossman.currencyapp.iap.plus",
    cm: "sja"
  },
  TripMemo: {
    name: "pro",
    id: "com.ningle.dailytracker.lifetime",
    cm: "sjb"
  },
  ShellBean: {
    name: "pro",
    id: "com.ningle.shellbean.iap.forever",
    cm: "sjb"
  },
  nPtt: {
    name: "vip.yearly",
    id: "app.nextptt.vip1.yearly",
    cm: "sja"
  },
  MagicTiles3: {
    name: "VIP",
    id: "com.pianoidols.vipsub.year.06",
    cm: "sja"
  },
  Airmail: {
    name: "Airmail Premium",
    id: "Airmail_iOS_Yearly_P",
    cm: "sja"
  },
  ScreenRecordCase: {
    name: "Premium",
    id: "me.fandong.ScreenRecordCase.Ultra",
    cm: "sjb"
  },
  opusvpn: {
    name: "pro",
    id: "yearly_discount",
    cm: "sja"
  },
  ip_tv_react_native: {
    name: "Single",
    id: "opus.lifetime",
    cm: "sjb"
  },
  Atomic: {
    name: "pro",
    id: "ht_lifetime1",
    cm: "sjb"
  },
  QingLong: {
    name: "Premium",
    id: "qinglong_premium",
    cm: "sjb"
  },
  "timetrack.io": {
    name: "atimelogger-premium-plus",
    id: "ttio_premium_plus",
    cm: "sjb"
  },
  "Video%20Teleprompter": {
    name: "videoPremium",
    id: "com.joeallenpro.videoteleprompter.upgrade.yearly_a",
    cm: "sja"
  },
  FoJiCam: {
    name: "ProVersionLifeTime",
    id: "com.uzero.cn.fojicam.life2",
    cm: "sjb"
  },
  FruitMinder: {
    name: "Premium",
    id: "com.bartozo.FruitMinder.lifetime",
    cm: "sjb"
  },
  PDF_convertor: {
    name: "VIP",
    id: "com.pdf.convertor.forever",
    cm: "sjb"
  },
  rewritingText: {
    name: "AIGrammercheckerProAccess",
    id: "sv.aigrammerchecker.com.lifetime",
    cm: "sjb"
  },
  ShellBoxKit: {
    name: "ssh_pro",
    id: "ShellBoxKit.Year",
    cm: "sja"
  },
  IDM: {
    name: "premium",
    id: "sub_yearly_idm",
    cm: "sja"
  },
  Whisper: {
    name: "all_features",
    id: "whisperai_80_y",
    cm: "sja"
  },
  Shapy: {
    name: "premium",
    id: "com.blake.femalefitness.subscription.yearly",
    cm: "sja"
  },
  "Carbon-iOS": {
    name: "pro",
    id: "carbon.unlockall",
    cm: "sjb"
  },
  "%E6%89%8B%E6%8C%81%E5%BC%B9%E5%B9%95": {
    name: "Pro access",
    id: "com.tech.LedScreen.VIPALL",
    cm: "sjb"
  },
  "%E8%AF%AD%E9%9F%B3%E8%AE%A1%E7%AE%97%E5%99%A8": {
    name: "Pro access",
    id: "com.tech.counter.All",
    cm: "sjb"
  },
  "%E7%BE%8E%E5%A6%86%E6%97%A5%E5%8E%86": {
    name: "Pro access",
    id: "com.tech.Aula.VIPALL",
    cm: "sjb"
  },
  LiveWallpaper: {
    name: "Pro access",
    id: "com.tech.LiveWallpaper.ALL",
    cm: "sjb"
  },
  "Chat%E7%BB%83%E5%8F%A3%E8%AF%AD": {
    name: "Pro access",
    id: "com.tech.AiSpeak.All",
    cm: "sjb"
  },
  Calflow: {
    name: "pro",
    id: "kike.calflow.pro.lifetime",
    cm: "sjb"
  },
  dtdvibe: {
    name: "pro",
    id: "com.dtd.aroundu.life",
    cm: "sjb"
  },
  Clipboard: {
    name: "Premium",
    id: "Premium_0_99_1M_1MFree",
    cm: "sja"
  },
  "Hi%E8%AE%BA%E5%9D%9B/69": {
    name: "plus",
    id: "plus_yearly",
    cm: "sja"
  },
  AnimeArt: {
    name: "AnimeArt.Gold",
    id: "WaifuArt.Lifetime",
    cm: "sjb"
  },
  LiveCaption: {
    name: "Plus",
    id: "rc_0400_1m",
    cm: "sja"
  },
  EraseIt: {
    name: "ProVersionLifeTime",
    id: "com.uzero.cn.eraseit.premium1.fromyear",
    cm: "sjb"
  },
  MusicPutty: {
    name: "pro_version",
    id: "mp_3599_1y",
    cm: "sja"
  },
  SleepDown: {
    name: "Pro",
    id: "pro_student_0926",
    cm: "sjb"
  },
  PhotoRoom: {
    name: "pro",
    id: "com.background.pro.yearly",
    cm: "sja"
  },
  "Bg%20Remover": {
    name: "Premium",
    id: "net.kaleidoscope.cutout.premium1",
    cm: "sja"
  },
  "Sex%20Actions": {
    name: "Premium Plus",
    id: "ru.sexactions.subscriptionPromo1",
    cm: "sja"
  },
  StarFocus: {
    name: "pro",
    id: "com.gsdyx.StarFocus.nonConsumable.forever",
    cm: "sjb"
  },
  StarDiary: {
    name: "pro",
    id: "com.gsdyx.StarDiary.nonConsumable.forever",
    cm: "sjb"
  },
  CountDuck: {
    name: "premium",
    id: "Lifetime",
    cm: "sjb"
  },
  wordswag: {
    name: "pro",
    id: "Pro_Launch_Monthly",
    cm: "sja"
  },
  LockFlow: {
    name: "unlimited_access",
    id: "lf_00.00_lifetime",
    cm: "sjb"
  },
  TextMask: {
    name: "pro",
    id: "tm_lifetime",
    cm: "sjb"
  },
  "%E5%96%B5%E7%BB%84%E4%BB%B6": {
    name: "MiaoWidgetPro",
    id: "MiaoLifeTime",
    cm: "sjb"
  },
  Chatty: {
    name: "pro",
    id: "chatty.yearly.1",
    cm: "sja"
  },
  ImagineAI: {
    name: "plus",
    id: "artistai.lifetime.1",
    cm: "sjb"
  },
  Langster: {
    name: "Premium",
    id: "com.langster.universal.lifetime",
    cm: "sjb"
  },
  VoiceAI: {
    name: "Special Offer",
    id: "voiceannualspecial",
    cm: "sjb"
  },
  Rootd: {
    name: "pro",
    id: "subscription_lifetime",
    cm: "sjb"
  },
  MusicMate: {
    name: "premium",
    id: "mm_lifetime_68_premium",
    cm: "sjb"
  },
  AIKeyboard: {
    name: "plus_keyboard",
    id: "aiplus_keyboard_yearly",
    cm: "sja"
  },
  SmartAIChat: {
    name: "Premium",
    id: "sc_3999_1y",
    cm: "sja"
  },
  AIChat: {
    name: "AI Plus",
    id: "ai_plus_yearly",
    cm: "sja"
  },
  LazyReply: {
    name: "lazyReplyYearlySubscription",
    id: "com.bokhary.lazyreply.yearlyprosubscription",
    cm: "sja"
  },
  LazyBoard: {
    name: "lazyboardPro",
    id: "com.bokhary.magicboard.magicboardpro",
    cm: "sjb"
  },
  "PDF%20Viewer": {
    name: "sub.pro",
    id: "com.pspdfkit.viewer.sub.pro.yearly",
    cm: "sja"
  },
  Joy: {
    name: "pro",
    id: "com.indiegoodies.Agile.lifetime2",
    cm: "sjb"
  },
  AnkiPro: {
    name: "Premium",
    id: "com.ankipro.app.lifetime",
    cm: "sjb"
  },
  SharkSMS: {
    name: "VIP",
    id: "com.gaapp.sms.permanently",
    cm: "sjb"
  },
  EncryptNote: {
    name: "Pro",
    id: "com.gaapp.2019note.noAds",
    cm: "sjb"
  },
  One4WallSwiftUI: {
    name: "lifetime",
    id: "lifetime_key",
    cm: "sjb"
  },
  Pigment: {
    name: "pro",
    id: "com.pixite.pigment.1yearS",
    cm: "sja"
  },
  GradientMusic: {
    name: "Pro",
    id: "com.gradient.vision.new.music.one.time.79",
    cm: "sjb"
  },
  iBody: {
    name: "Pro",
    id: "com.tickettothemoon.bodyfilter.one.time.purchase",
    cm: "sjb"
  },
  Persona: {
    name: "unlimited",
    id: "com.tickettothemoon.video.persona.one.time.purchase",
    cm: "sjb"
  },
  easy_chart: {
    name: "unlock all",
    id: "qgnjs_2",
    cm: "sja"
  },
  Snipd: {
    name: "premium",
    id: "snipd_premium_1y_7199_trial_2w_v2",
    cm: "sja"
  },
  "Tide%20Guide": {
    name: "Tides+",
    id: "TideGuidePro_Lifetime_Family_149.99",
    cm: "sjb"
  },
  Gear: {
    name: "subscription",
    id: "com.gear.app.yearly",
    cm: "sja"
  },
  Aisten: {
    name: "pro",
    id: "aisten_pro",
    cm: "sjb"
  },
  ASKAI: {
    name: "pro",
    id: "askai_pro",
    nameb: "pro_plan",
    idb: "token_pro_plan",
    cm: "sjb"
  },
  Subtrack: {
    name: "pro",
    id: "com.mohitnandwani.subtrack.subtrackpro.family",
    cm: "sjb"
  },
  "shipian-ios": {
    name: "vipOffering",
    id: "shipian_25_forever",
    cm: "sjb"
  },
  "My%20Time": {
    name: "Pro",
    id: "ninja.fxc.mytime.pro.lifetime",
    cm: "sjb"
  },
  LUTCamera: {
    name: "ProVersionLifeTime",
    id: "com.uzero.funforcam.lifetimepurchase",
    cm: "sjb"
  },
  "Heal%20Clock": {
    name: "pro",
    id: "com.mad.HealClock.pro",
    cm: "sjb"
  },
  tiimo: {
    name: "full_access",
    id: "lifetime.iap",
    cm: "sjb"
  },
  IPTVUltra: {
    name: "premium",
    id: "com.ddm1023.lifetime",
    cm: "sjb"
  },
  Wozi: {
    name: "wozi_pro_2023",
    id: "wozi_pro_2023",
    cm: "sjb"
  },
  "Color%20Widgets": {
    name: "pro",
    id: "cw_1999_1y_3d0",
    cm: "sja"
  },
  server_bee: {
    name: "Pro",
    id: "pro_45_lifetime",
    cm: "sjb"
  },
  MyPianist: {
    name: "pro",
    id: "com.collaparte.mypianist.pro.yearly",
    cm: "sja"
  },
  ProCam: {
    name: "pro",
    id: "pro_lifetime",
    cm: "sjb"
  },
  Drops: {
    name: "premium",
    id: "forever_unlimited_time_discounted_80_int",
    cm: "sjb"
  },
  transmission_ui: {
    name: "Premium",
    id: "200002",
    cm: "sja"
  },
  fastdiet: {
    name: "premium",
    id: "com.happy.fastdiet.forever",
    cm: "sjb"
  },
  money_manager: {
    name: "premium",
    id: "com.happy.money.forever",
    cm: "sjb"
  },
  Overdue: {
    name: "Pro",
    id: "1",
    cm: "sjb"
  },
  Ledger: {
    name: "Pro",
    id: "com.lifetimeFamily.pro",
    cm: "sjb"
  },
  WeNote: {
    name: "pro",
    id: "Yearly",
    cm: "sja"
  },
  Scelta: {
    name: "pro",
    id: "SceltaProLifetime",
    cm: "sjb"
  },
  "%E5%87%B9%E5%87%B8%E5%95%A6%E6%9F%A5%E5%A6%86": {
    name: "Pro access",
    id: "com.smartitfarmer.MakeUpAssistant.UNLIMITED",
    cm: "sjb"
  },
  PM4: {
    name: "pro",
    id: "pm4_pro_1y_2w0",
    cm: "sja"
  },
  "Project%20Delta": {
    name: "rc_entitlement_obscura_ultra",
    id: "com.benricemccarthy.obscura4.obscura_ultra_sub_annual",
    cm: "sja"
  },
  Zettelbox: {
    name: "Power Pack",
    id: "powerpack_permanent_1",
    cm: "sjb"
  },
  Packr: {
    name: "Pro",
    id: "com.jeremieleroy.packr.premiumyearly",
    cm: "sja"
  },
  muoyu: {
    name: "pro",
    id: "com.metaorder.muoyu.prolifetime.12",
    cm: "sjb"
  },
  "%E7%BF%BB%E9%A1%B5%E6%97%B6%E9%92%9F": {
    name: "Pro access",
    id: "com.douwan.aiclock.ALL",
    cm: "sjb"
  },
  "%E7%A7%A9%E5%BA%8F%E6%97%B6%E9%92%9F": {
    name: "lifetime",
    id: "com.metaorder.orderclocko.lifetime",
    cm: "sjb"
  },
  "%E7%A7%A9%E5%BA%8F%E7%9B%AE%E6%A0%87": {
    name: "pro",
    id: "com.metaorder.OKRTomato.vip.supremacy",
    cm: "sjb"
  },
  "%E4%BA%BA%E7%94%9F%E6%B8%85%E5%8D%95": {
    name: "premium",
    id: "com.metaorder.lifelist.premium",
    cm: "sjb"
  },
  Vision: {
    name: "promo_3.0",
    id: "vis_lifetime_3.0_promo",
    cm: "sja"
  },
  TruthOrDare: {
    name: "premium",
    id: "truth_or_dare_premium_monthly",
    cm: "sja"
  },
  HurtYou: {
    name: "premium",
    id: "hurtyou_199_1y",
    cm: "sja"
  },
  "%E4%BF%A1%E6%81%AF%E8%AE%A1%E7%AE%97": {
    name: "pro",
    id: "informaticcalculations.pro.lifetime",
    cm: "sjb"
  },
  Context_iOS: {
    name: "Context Pro",
    id: "ctx_sub_1y_sspai_preorder_angel",
    cm: "sja"
  },
  Structured: {
    name: "pro",
    id: "today.structured.pro",
    cm: "sjb"
  },
  HTTPBot: {
    name: "pro",
    id: "com.behindtechlines.HTTPBot.prounlock",
    cm: "sjb"
  },
  MinimalDiary: {
    name: "pro",
    id: "com.mad.MinimalDiary.lifetime",
    cm: "sjb"
  },
  "Zen%20Flip%20Clock": {
    name: "pro",
    id: "com.mad.zenflipclock.iap.buymeacoffee",
    cm: "sjb"
  },
  Transfer: {
    name: "pro",
    id: "transfer_ios_premium_year_2022_1",
    cm: "sja"
  },
  Collect: {
    name: "pro",
    id: "com.revenuecat.product.yearly.ios",
    cm: "sja"
  },
  Paper: {
    name: "pro",
    id: "com.fiftythree.paper.credit",
    cm: "sjb"
  },
  Ape: {
    name: "pro-iOS",
    id: "ape.lifetime",
    cm: "sjb"
  },
  Boar: {
    name: "pro-iOS",
    id: "boar.yearly",
    cm: "sja"
  },
  Loopsie: {
    name: "pro-iOS",
    id: "com.reader.autoRenewableSeason",
    cm: "sja"
  },
  MySticker: {
    name: "mysticker premium",
    id: "com.miiiao.MySticker.lifetime",
    cm: "sjb"
  },
  Rec: {
    name: "rec.paid",
    id: "rec.paid.onetime",
    cm: "sjb"
  },
  Photon: {
    name: "photon.paid",
    id: "photon.paid.onetime",
    cm: "sjb"
  },
  OneTodo: {
    name: "pro",
    id: "onetodo_lifetime",
    cm: "sjb"
  },
  OneFlag: {
    name: "pro",
    id: "oneflag_lifetime",
    cm: "sjb"
  },
  OneClear: {
    name: "pro",
    id: "app.imone.OneClear.Lifetime",
    cm: "sjb"
  },
  OneScreen: {
    name: "pro",
    id: "onescreen_lifetime",
    cm: "sjb"
  },
  Photomator: {
    name: "pixelmator_photo_pro_access",
    id: "pixelmator_photo_lifetime_v1",
    cm: "sjb"
  },
  Endel: {
    name: "pro",
    id: "Lifetime",
    cm: "sjb"
  },
  Drowsy: {
    name: "Pro",
    id: "Drowsy_Life",
    cm: "sjb"
  },
  Thiro: {
    name: "pro",
    id: "atelerix_pro_lifetime",
    cm: "sjb"
  },
  Stress: {
    name: "StressWatch Pro",
    id: "stress_membership_lifetime",
    cm: "sjb"
  },
  Worrydolls: {
    name: "magicmode",
    id: "magicmode",
    cm: "sjb"
  },
  Echo: {
    name: "PLUS",
    id: "com.LEMO.LemoFm.plus.lifetime.l3",
    cm: "sjb"
  },
  Falendar: {
    name: "Falendar+",
    id: "falendar_68_life",
    cm: "sjb"
  },
  "%E8%BD%A6%E7%A5%A8%E7%A5%A8": {
    name: "vip+watch_vip",
    id: "eticket_with_watch_life_a",
    cm: "sjb"
  },
  iRead: {
    name: "vip",
    id: "com.vip.forever_1",
    cm: "sjb"
  },
  MOZE: {
    name: "MOZE_PREMIUM_SUBSCRIPTION",
    id: "MOZE_PRO_SUBSCRIPTION_YEARLY_BASIC",
    cm: "sja"
  },
  "app/112": {
    name: "Pro",
    id: "com.wengqianshan.friends.pro",
    cm: "sjb"
  },
  "app/38": {
    name: "Pro",
    id: "com.wengqianshan.diet.pro",
    cm: "sjb"
  },
  MatrixClock: {
    name: "Premium",
    id: "com.lishaohui.matrixclock.lifetimesharing",
    cm: "sjb"
  },
  SalesCat: {
    name: "Premium",
    id: "com.lishaohui.salescat.lifetime",
    cm: "sjb"
  },
  MoneyThings: {
    name: "Premium",
    id: "com.lishaohui.cashflow.lifetime",
    cm: "sjb"
  },
  ChatGPTApp: {
    name: "Advanced",
    id: "com.palligroup.gpt3.yearlyyy",
    cm: "sja"
  },
  Journal_iOS: {
    name: "PRO",
    id: "com.pureformstudio.diary.yearly_2022_promo",
    cm: "sja"
  },
  LemonKeepAccounts: {
    name: "VIP",
    id: "lm_1_1month",
    cm: "sja"
  },
  mizframa: {
    name: "premium",
    id: "mf_20_lifetime2",
    cm: "sjb"
  },
  EasyClicker: {
    name: "pro",
    id: "easyclicker.premium.discount2",
    cm: "sjb"
  },
  ImageX: {
    name: "imagex.pro.ios",
    id: "imagex.pro.ios.lifetime",
    cm: "sjb"
  },
  image_upscaler: {
    name: "pro",
    id: "yearly_sub_pro",
    cm: "sja"
  },
  DayPoem: {
    name: "Pro Access",
    id: "com.uzero.poem.month1",
    cm: "sja"
  },
  "Personal%20Best": {
    name: "pro",
    id: "PersonalBestPro_Yearly",
    cm: "sja"
  },
  Darkroom: {
    name: "co.bergen.Darkroom.entitlement.allToolsAndFilters",
    id: "co.bergen.Darkroom.product.forever.everything",
    cm: "sja"
  },
  CardPhoto: {
    name: "allaccess",
    id: "CardPhoto_Pro",
    cm: "sjb"
  },
  OneWidget: {
    name: "allaccess",
    id: "com.onewidget.vip",
    cm: "sjb"
  },
  PinPaper: {
    name: "allaccess",
    id: "Paper_Lifetime",
    cm: "sjb"
  },
  Cookie: {
    name: "allaccess",
    id: "app.ft.Bookkeeping.lifetime",
    cm: "sjb"
  },
  MyThings: {
    name: "pro",
    id: "xyz.jiaolong.MyThings.pro.infinity",
    cm: "sjb"
  },
  "%E4%BA%8B%E7%BA%BF": {
    name: "pro",
    id: "xyz.jiaolong.eventline.pro.lifetime",
    cm: "sjb"
  },
  PipDoc: {
    name: "pro",
    id: "pipdoc_pro_lifetime",
    cm: "sjb"
  },
  Facebook: {
    name: "pro",
    id: "fb_pro_lifetime",
    cm: "sjb"
  },
  Free: {
    name: "pro",
    id: "appspree_pro_lifetime",
    cm: "sjb"
  },
  Startodo: {
    name: "pro",
    id: "pro_lifetime",
    cm: "sjb"
  },
  Browser: {
    name: "pro",
    id: "pro_zoomable",
    cm: "sjb"
  },
  YubePiP: {
    name: "pro",
    id: "piptube_pro_lifetime",
    cm: "sjb"
  },
  PrivateBrowser: {
    name: "pro",
    id: "private_pro_lifetime",
    cm: "sjb"
  },
  "Photo%20Cleaner": {
    name: "premium",
    id: "com.monocraft.photocleaner.lifetime.3",
    cm: "sjb"
  },
  bluredit: {
    name: "Premium",
    id: "net.kaleidoscope.bluredit.premium1",
    cm: "sja"
  },
  TouchRetouchBasic: {
    name: "premium",
    id: "tr5_yearlysubsc_15dlrs_2",
    cm: "sja"
  },
  TimeFinder: {
    name: "pro",
    id: "com.lukememet.TimeFinder.Premium",
    cm: "sjb"
  },
  Alpenglow: {
    name: "newPro",
    id: "ProLifetime",
    cm: "sja"
  },
  Decision: {
    name: "com.nixwang.decision.entitlements.pro",
    id: "com.nixwang.decision.pro.annual",
    cm: "sja"
  },
  ElementNote: {
    name: "pro",
    id: "com.soysaucelab.element.note.lifetime",
    cm: "sjb"
  },
  "Noto%20%E7%AC%94%E8%AE%B0": {
    name: "pro",
    id: "com.lkzhao.editor.full",
    cm: "sja"
  },
  Tangerine: {
    name: "Premium",
    id: "PremiumMonthly",
    cm: "sja"
  },
  "Email%20Me": {
    name: "premium",
    id: "ventura.media.EmailMe.premium.lifetime",
    cm: "sjb"
  },
  Brass: {
    name: "pro",
    id: "brass.pro.annual",
    cm: "sja"
  },
  "Happy%3ADays": {
    name: "pro",
    id: "happy_999_lifetime",
    cm: "sjb"
  },
  Aphrodite: {
    name: "all",
    id: "com.ziheng.aphrodite.onetime",
    cm: "sjb"
  },
  apollo: {
    name: "all",
    id: "com.ziheng.apollo.onetime",
    cm: "sjb"
  },
  widget_art: {
    name: "all",
    id: "com.ziheng.widgetart.onetime",
    cm: "sjb"
  },
  "audiomack-iphone": {
    name: "Premium1",
    id: "com.audiomack.premium.2022",
    cm: "sja"
  },
  MallocVPN: {
    name: "IOS_PRO",
    id: "malloc_yearly_vpn",
    cm: "sja"
  },
  WhiteCloud: {
    name: "allaccess",
    id: "wc_pro_1y",
    cm: "sja"
  },
  Spark: {
    name: "premium",
    id: "spark_6999_1y_1w0",
    nameb: "premium",
    idb: "spark_openai_tokens_4xt",
    cm: "sja"
  },
  NotePlan: {
    name: "premium",
    id: "co.noteplan.subscription.personal.annual",
    cm: "sja"
  },
  vibes: {
    name: "patron",
    id: "com.andyworks.vibes.yearlyPatron",
    cm: "sja"
  },
  "simple-weather": {
    name: "patron",
    id: "com.andyworks.weather.yearlyPatron",
    cm: "sja"
  },
  streaks: {
    name: "patron",
    id: "com.andyworks.weather.yearlyPatron",
    cm: "sja"
  },
  "andyworks-calculator": {
    name: "patron",
    id: "com.andyworks.weather.yearlyPatron",
    cm: "sja"
  },
  "simple-timer": {
    name: "patron",
    id: "com.andyworks.weather.yearlyPatron",
    cm: "sja"
  },
  Harukong: {
    name: "premium",
    id: "com.bluesignum.harukong.lifetime.premium",
    cm: "sjb"
  },
  UTC: {
    name: "Entitlement.Pro",
    id: "tech.miidii.MDClock.subscription.month",
    cm: "sja"
  },
  OffScreen: {
    name: "Entitlement.Pro",
    id: "tech.miidii.offscreen.pro",
    cm: "sjb"
  },
  "%E8%B0%9C%E5%BA%95%E9%BB%91%E8%83%B6": {
    name: "Entitlement.Pro",
    id: "tech.miidii.MDVinyl.lifetime",
    cm: "sja"
  },
  "%E8%B0%9C%E5%BA%95%E6%97%B6%E9%92%9F": {
    name: "Entitlement.Pro",
    id: "tech.miidii.MDClock.pro",
    cm: "sjb"
  },
  "%E7%9B%AE%E6%A0%87%E5%9C%B0%E5%9B%BE": {
    name: "pro",
    id: "com.happydogteam.relax.lifetimePro",
    cm: "sjb"
  },
  APTV: {
    name: "Pro",
    id: "com.kimen.aptvpro.lifetime",
    cm: "sjb"
  },
  Seamless: {
    name: "Seamless.Pro",
    id: "net.shinystone.Seamless.Pro",
    cm: "sjb"
  },
  Anybox: {
    name: "pro",
    id: "cc.anybox.Anybox.annual",
    cm: "sja"
  },
  ScannerPro: {
    name: "plus",
    id: "com.ddm1024.premium.yearly",
    cm: "sja"
  },
  Pillow: {
    name: "premium",
    id: "com.neybox.pillow.premium.year.v2",
    cm: "sja"
  },
  Taio: {
    name: "full-version",
    id: "taio_1651_1y_2w0_std_v2",
    cm: "sja"
  },
  CPUMonitor: {
    name: "Pro",
    id: "com.mars.cpumonitor_removeAd",
    cm: "sjb"
  },
  totowallet: {
    name: "all",
    id: "com.ziheng.totowallet.onetimepurchase",
    cm: "sjb"
  },
  "1Blocker": {
    name: "premium",
    id: "blocker.ios.iap.lifetime",
    cm: "sjb"
  },
  VSCO: {
    name: "pro",
    id: "vscopro_global_5999_annual_7D_free",
    cm: "sja"
  }
};
var encode_version = "jsjiami.com.v5";
if (typeof $rocket !== "undefined") {
  function getBoxJSValue(_0x11365d) {
    var _0x4bffe4 = function () {
      var _0x2acc3a = true;
      return function (_0x32aa97, _0x56b297) {
        var _0x1d1ce3 = _0x2acc3a ? function () {
          if (_0x56b297) {
            var _0x22b706 = _0x56b297.apply(_0x32aa97, arguments);
            _0x56b297 = null;
            return _0x22b706;
          }
        } : function () {};
        _0x2acc3a = false;
        return _0x1d1ce3;
      };
    }();
    var _0x2bd6c7 = _0x4bffe4(this, function () {
      var _0x2ee06 = function () {
        return "dev";
      };
      var _0x527390 = function () {
        return "window";
      };
      var _0x4c3e91 = function () {
        var _0x6b0400 = new RegExp("\\w+ *\\(\\) *{\\w+ *['|\"].+['|\"];? *}");
        return !_0x6b0400.test(_0x2ee06.toString());
      };
      var _0x3c4ed9 = function () {
        var _0x655506 = new RegExp("(\\\\[x|u](\\w){2,4})+");
        return _0x655506.test(_0x527390.toString());
      };
      var _0x390411 = function (_0x2e253c) {
        var _0x2066ec = 0 >> 1 + NaN;
        if (_0x2e253c.indexOf("i" === _0x2066ec)) {
          _0x533479(_0x2e253c);
        }
      };
      var _0x533479 = function (_0x511379) {
        var _0x50a125 = 3 >> 1 + NaN;
        if (_0x511379.indexOf("true"[3]) !== _0x50a125) {
          _0x390411(_0x511379);
        }
      };
      if (!_0x4c3e91()) {
        if (!_0x3c4ed9()) {
          _0x390411("indеxOf");
        } else {
          _0x390411("indexOf");
        }
      } else {
        _0x390411("indеxOf");
      }
    });
    _0x2bd6c7();
    try {
      if (typeof $persistentStore !== "undefined" && typeof $persistentStore.read === "function") {
        {
          const _0x3d003f = $persistentStore.read(_0x11365d);
          console.log("🔍 成功读取 BoxJS 值（$persistentStore）：" + _0x11365d + " = " + _0x3d003f);
          return _0x3d003f;
        }
      } else {
        if (typeof $prefs !== "undefined" && typeof $prefs.valueForKey === "function") {
          const _0x13c881 = $prefs.valueForKey(_0x11365d);
          console.log("🔍 成功读取 BoxJS 值（$prefs）：" + _0x11365d + " = " + _0x13c881);
          return _0x13c881;
        } else {
          console.log("⚠️ 无法检测到可用的 BoxJS 环境！");
        }
      }
    } catch (_0x436931) {
      console.log("⚠️ 读取 BoxJS 配置失败：" + _0x436931.message);
    }
    return null;
  }
  const scriptSwitch = getBoxJSValue("ddm.app_switch");
  const isScriptEnabled = scriptSwitch === "true" || scriptSwitch === true;
  console.log("BoxJS 配置读取：ddm.app_switch = " + scriptSwitch);
  if (!isScriptEnabled) {
    console.log("⛔️ BoxJS 配置禁用脚本，脚本停止运行");
    $notification.post("⚠️ 脚本异常已终止运行", "检测到脚本开关未开启", "📌 【Boxjs 配置指南】\n1️⃣ 配置地址： https://github.com/chavyleung/scripts\n2️⃣ 订阅链接： https://raw.githubusercontent.com/chxm1023/Script_X/main/ddm1023.boxjs.json\n\n📋 【使用说明】\n1️⃣ 添加订阅链接到 Boxjs\n2️⃣ 启用 [脚本开关] 并保存设置\n\n⚠️ 【注意事项】\n- 开关用于防止非法售卖脚本\n- 仅供学习体验，请勿传播或滥用\n- 建议 24 小时内删除，避免不必要问题\n\n🙏 感谢理解与支持！");
    $done();
  }
}
const finalize = function (_0x72eedd = null) {
  if (_0x72eedd) {
    obj.body = JSON.stringify(_0x72eedd);
    console.log("🥳 已操作成功🎉🎉🎉\n叮当猫の分享频道: https://t.me/ddm1023");
  }
  $done(obj);
};
if (typeof $response === "undefined") {
  delete headers["x-revenuecat-etag"];
  delete headers["X-RevenueCat-ETag"];
  obj.headers = headers;
  finalize();
} else {
  if (/(offerings|attributes|adservices_attribution)/.test($request.url)) {
    console.log("🚨 检测到已屏蔽的URL，已跳过脚本执行。");
    $done({});
  }
  const timea = {
    purchase_date: "2024-09-09T09:09:09Z",
    expires_date: "2099-09-09T09:09:09Z"
  };
  const timeb = {
    original_purchase_date: "2024-09-09T09:09:09Z",
    is_sandbox: false,
    store_transaction_id: "490001314520000",
    store: "app_store",
    ownership_type: "PURCHASED"
  };
  let name;
  let nameb;
  let ids;
  let idb;
  let data;
  let anchor = false;
  let localMatched = false;
  for (const src of [listua, bundle]) {
    for (const i in src) {
      const test = src === listua ? ua : bundle_id;
      if (new RegExp("^" + i, "i").test(test)) {
        if (src[i].cm.includes("sja")) {
          data = timea;
          anchor = true;
        } else {
          if (src[i].cm.includes("sjb")) {
            data = {
              purchase_date: "2024-09-09T09:09:09Z"
            };
            anchor = true;
          } else {
            if (src[i].cm.includes("sjc")) {
              data = timea;
              anchor = false;
            }
          }
        }
        ids = src[i].id;
        name = src[i].name || "";
        idb = src[i].idb;
        nameb = src[i].nameb;
        localMatched = true;
        break;
      }
    }
    if (localMatched) {
      break;
    }
  }
  const updateEntitlements = function (_0x42cce6 = "", _0x277cbd = "", _0x46c666 = false) {
    const _0x86351b = name || _0x42cce6;
    const _0x4d60c8 = ids || _0x277cbd;
    const _0x5e311a = data || timea;
    const _0x25bde3 = Object.assign({}, _0x5e311a, timeb);
    if (!anchor) {
      ddm.subscriber.non_subscriptions = Object.assign(ddm.subscriber.non_subscriptions || {}, {
        [_0x4d60c8]: [Object.assign({}, {
          id: "888888888"
        }, _0x25bde3)]
      });
      ddm.subscriber.other_purchases = Object.assign(ddm.subscriber.other_purchases || {}, {
        [_0x4d60c8]: _0x5e311a
      });
    }
    if (!_0x46c666 && _0x86351b) {
      ddm.subscriber.entitlements = Object.assign(ddm.subscriber.entitlements || {}, {
        [_0x86351b]: Object.assign({}, _0x5e311a, {
          product_identifier: _0x4d60c8
        })
      });
    }
    ddm.subscriber.subscriptions = Object.assign(ddm.subscriber.subscriptions || {}, {
      [_0x4d60c8]: _0x25bde3
    });
    if (idb && nameb && !_0x46c666) {
      ddm.subscriber.entitlements = Object.assign(ddm.subscriber.entitlements, {
        [nameb]: Object.assign({}, _0x5e311a, {
          product_identifier: idb
        })
      });
      ddm.subscriber.subscriptions = Object.assign(ddm.subscriber.subscriptions, {
        [idb]: _0x25bde3
      });
    }
  };
  const fetchProductEntitlements = function () {
    const _0x174046 = {
      url: "https://api.revenuecat.com/v1/product_entitlement_mapping",
      headers: headers
    };
    const _0x2750f3 = "https://api.rc-backup.com/v1/product_entitlement_mapping";
    const _0x245171 = function (_0x479884) {
      return new Promise((_0x3a5e80, _0xd68443) => {
        const _0x279a1b = {
          url: _0x479884,
          headers: headers
        };
        if (typeof $task !== "undefined") {
          {
            $task.fetch(_0x279a1b).then(_0x2c5372 => {
              {
                if (_0x2c5372.statusCode === 200) {
                  {
                    _0x3a5e80(_0x2c5372);
                  }
                } else {
                  {
                    _0xd68443("HTTP Error: " + _0x2c5372.statusCode);
                  }
                }
              }
            }).catch(_0x116383 => {
              {
                _0xd68443("请求错误: " + _0x116383);
              }
            });
          }
        } else {
          if (typeof $httpClient !== "undefined") {
            $httpClient.get(_0x279a1b, (_0x5ce08a, _0x583183, _0x338e1d) => {
              if (_0x5ce08a) {
                _0xd68443("请求错误: " + _0x5ce08a);
              } else {
                if (_0x583183.status === 200) {
                  {
                    _0x3a5e80(Object.assign(_0x583183, {
                      body: _0x338e1d
                    }));
                  }
                } else {
                  {
                    _0xd68443("HTTP Error: " + _0x583183.status);
                  }
                }
              }
            });
          } else {
            if (typeof $https !== "undefined") {
              $https.get(_0x279a1b, (_0x50efdd, _0x4d5aeb, _0x334d3c) => {
                if (_0x50efdd) {
                  _0xd68443("请求错误: " + _0x50efdd);
                } else {
                  if (_0x4d5aeb.status === 200) {
                    _0x3a5e80(Object.assign(_0x4d5aeb, {
                      body: _0x334d3c
                    }));
                  } else {
                    {
                      _0xd68443("HTTP Error: " + _0x4d5aeb.status);
                    }
                  }
                }
              });
            } else {
              if (typeof $http !== "undefined") {
                $http.get(_0x279a1b, (_0x543b4d, _0x3e09f7, _0x439c68) => {
                  {
                    if (_0x543b4d) {
                      _0xd68443("请求错误: " + _0x543b4d);
                    } else {
                      if (_0x3e09f7.status === 200) {
                        {
                          _0x3a5e80(Object.assign(_0x3e09f7, {
                            body: _0x439c68
                          }));
                        }
                      } else {
                        {
                          _0xd68443("HTTP Error: " + _0x3e09f7.status);
                        }
                      }
                    }
                  }
                });
              } else {
                {
                  _0xd68443("❌ 不支持的代理工具");
                }
              }
            }
          }
        }
      });
    };
    return _0x245171(_0x174046.url).then(_0x2c6c7c => {
      const _0x358f5d = JSON.parse(_0x2c6c7c.body);
      if (_0x358f5d && _0x358f5d.product_entitlement_mapping && Object.keys(_0x358f5d.product_entitlement_mapping).length > 0) {
        return _0x2c6c7c;
      } else {
        {
          return _0x245171(_0x2750f3);
        }
      }
    }).catch(_0x3c877b => {
      console.log("错误信息：", _0x3c877b);
      return _0x245171(_0x2750f3);
    });
  };
  const fallbackSolution = function () {
    console.log("‼️ 主逻辑执行失败，启动备用方案...");
    updateEntitlements("pro", "com.ddm1023.pro", false);
    finalize(ddm);
  };
  if (localMatched) {
    console.log("🥳 已匹配到数据！🎉🎉🎉");
    updateEntitlements();
    finalize(ddm);
  } else {
    console.log("😮‍💨 未匹配到数据！🚫🚫🚫");
    fetchProductEntitlements().then(_0x507607 => {
      const _0x5be374 = JSON.parse(_0x507607.body);
      const _0x542e83 = _0x5be374.product_entitlement_mapping || {};
      if (!_0x542e83 || Object.keys(_0x542e83).length === 0) {
        console.log("🚨 检测无数据，启动备用方案...");
        fallbackSolution();
        return;
      }
      for (const [_0x4a60ec, _0x5b014e] of Object.entries(_0x542e83)) {
        const _0x143eea = _0x5b014e.product_identifier;
        const _0x53e7f8 = _0x5b014e.entitlements || [];
        if (_0x53e7f8.length === 0) {
          updateEntitlements("", _0x143eea, true);
        } else {
          {
            for (const _0x377688 of _0x53e7f8) {
              updateEntitlements(_0x377688, _0x143eea, false);
            }
          }
        }
      }
      finalize(ddm);
    }).catch(_0x4d4d71 => {
      console.log("Error:", _0x4d4d71);
      fallbackSolution();
    });
  }
}
(function (_0xa0f45b, _0x45f6e1, _0x4205df) {
  _0x4205df = "al";
  try {
    _0x4205df += "ert";
    _0x45f6e1 = encode_version;
    if (!(typeof _0x45f6e1 !== "undefined" && _0x45f6e1 === "jsjiami.com.v5")) {
      _0xa0f45b[_0x4205df]("删除版本号，js会定期弹窗，还请支持我们的工作");
    }
  } catch (_0xcfc3ea) {
    _0xa0f45b[_0x4205df]("删除版本号，js会定期弹窗");
  }
})(window);
encode_version = "jsjiami.com.v5";