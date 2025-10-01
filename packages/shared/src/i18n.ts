import type { Lang } from './prefs';

export type I18nKey =
  | 'earn_bonus'
  | 'personalized_for_country'
  | 'wallet_title'
  | 'add_money'
  | 'cash_summary'
  | 'available_cash'
  | 'cash_in_transit'
  | 'recent_activity'
  | 'see_all'
  | 'scan_qr'
  | 'point_camera'
  | 'confirm_payment'
  | 'merchant'
  | 'amount'
  | 'country'
  | 'place_name'
  | 'wallet'
  | 'points'
  | 'confirm_pay'
  | 'back'
  | 'payment_successful'
  | 'method'
  | 'tx_hash'
  | 'utilities'
  | 'streak_zero'
  | 'points_balance'
  | 'add_points'
  | 'tier'
  | 'conversion_chip'
  | 'visited_countries'
  | 'badges'
  | 'where_use_title'
  | 'where_use_subtitle'
  | 'choose_language_title'
  | 'choose_language_subtitle'
  | 'continue_btn'
  | 'save_btn'
;

type Dict = Record<I18nKey, string>;

const en: Dict = {
  earn_bonus: 'Earn 30 USD',
  personalized_for_country: 'Your experience is personalized for {country}.',
  wallet_title: "{name}'s wallet • USD",
  add_money: 'Add money',
  cash_summary: 'Cash summary',
  available_cash: 'Available cash',
  cash_in_transit: 'Cash in transit',
  recent_activity: 'Recent activity',
  see_all: 'See all',
  scan_qr: 'Scan Merchant QR',
  point_camera: 'Point your camera at the QR code.',
  confirm_payment: 'Confirm Payment',
  merchant: 'Merchant',
  amount: 'Amount',
  country: 'Country',
  place_name: 'Place name',
  wallet: 'Wallet',
  points: 'Points',
  confirm_pay: 'Confirm Pay',
  back: 'Back',
  payment_successful: 'Payment Successful',
  method: 'Method',
  tx_hash: 'Tx Hash',
  utilities: 'Utilities',
  streak_zero: 'Streak: 0 days',
  points_balance: 'JetSet Points Balance',
  add_points: 'Add points',
  tier: 'Tier',
  conversion_chip: '1,000 JP = 1 {currency}',
  visited_countries: 'Visited countries',
  badges: 'Badges',
  where_use_title: 'Where will you use JetSet?',
  where_use_subtitle: "Select the country you'd like the app to display in. You can change this at any time.",
  choose_language_title: 'Choose your language',
  choose_language_subtitle: "Select the language you'd like JetSet to use.",
  continue_btn: 'Continue',
  save_btn: 'Save',
};

const hi: Dict = {
  ...en,
  earn_bonus: '30 USD कमाएँ',
  personalized_for_country: '{country} के लिए आपका अनुभव व्यक्तिगत है।',
  wallet_title: "{name} का वॉलेट • USD",
  add_money: 'पैसे जोड़ें',
  cash_summary: 'नकद सारांश',
  available_cash: 'उपलब्ध नकद',
  cash_in_transit: 'प्रेषण में नकद',
  recent_activity: 'हाल की गतिविधि',
  see_all: 'सभी देखें',
  scan_qr: 'मर्चेंट क्यूआर स्कैन करें',
  point_camera: 'क्यूआर कोड पर कैमरा रखें।',
  confirm_payment: 'भुगतान की पुष्टि करें',
  merchant: 'व्यापारी',
  amount: 'राशि',
  country: 'देश',
  place_name: 'स्थान',
  wallet: 'वॉलेट',
  points: 'पॉइंट्स',
  confirm_pay: 'भुगतान पुष्टि',
  back: 'वापस',
  payment_successful: 'भुगतान सफल',
  method: 'तरीका',
  tx_hash: 'ट्रांज़ैक्शन हैश',
  utilities: 'उपयोगिताएँ',
  streak_zero: 'स्ट्रिक: 0 दिन',
  points_balance: 'जेटसेट पॉइंट्स बैलेंस',
  add_points: 'पॉइंट्स जोड़ें',
  tier: 'स्तर',
  conversion_chip: '1,000 JP = 1 {currency}',
  visited_countries: 'देखे गए देश',
  badges: 'बैज',
  where_use_title: 'आप JetSet कहाँ उपयोग करेंगे?',
  where_use_subtitle: 'देश चुनें जिसमें आप ऐप प्रदर्शित करना चाहते हैं। आप इसे कभी भी बदल सकते हैं।',
  choose_language_title: 'अपनी भाषा चुनें',
  choose_language_subtitle: 'JetSet के लिए भाषा चुनें।',
  continue_btn: 'जारी रखें',
  save_btn: 'सहेजें',
};

const id: Dict = {
  ...en,
  earn_bonus: 'Dapatkan 30 USD',
  personalized_for_country: 'Pengalaman Anda dipersonalisasi untuk {country}.',
  wallet_title: 'Dompet {name} • USD',
  add_money: 'Tambah saldo',
  cash_summary: 'Ringkasan kas',
  available_cash: 'Kas tersedia',
  cash_in_transit: 'Kas dalam proses',
  recent_activity: 'Aktivitas terbaru',
  see_all: 'Lihat semua',
  scan_qr: 'Pindai QR Merchant',
  point_camera: 'Arahkan kamera ke kode QR.',
  confirm_payment: 'Konfirmasi Pembayaran',
  merchant: 'Merchant',
  amount: 'Jumlah',
  country: 'Negara',
  place_name: 'Nama tempat',
  wallet: 'Dompet',
  points: 'Poin',
  confirm_pay: 'Konfirmasi Bayar',
  back: 'Kembali',
  payment_successful: 'Pembayaran Berhasil',
  method: 'Metode',
  tx_hash: 'Tx Hash',
  utilities: 'Utilitas',
  streak_zero: 'Streak: 0 hari',
  points_balance: 'Saldo JetSet Points',
  add_points: 'Tambah poin',
  tier: 'Tingkat',
  conversion_chip: '1,000 JP = 1 {currency}',
  visited_countries: 'Negara yang dikunjungi',
  badges: 'Lencana',
  where_use_title: 'Di mana Anda akan menggunakan JetSet?',
  where_use_subtitle: 'Pilih negara tampilan aplikasi. Anda bisa mengubahnya kapan saja.',
  choose_language_title: 'Pilih bahasa Anda',
  choose_language_subtitle: 'Pilih bahasa untuk JetSet.',
  continue_btn: 'Lanjut',
  save_btn: 'Simpan',
};

const th: Dict = {
  ...en,
  earn_bonus: 'รับ 30 USD',
  personalized_for_country: 'ประสบการณ์ของคุณกำหนดเองสำหรับ {country}',
  wallet_title: 'กระเป๋าสตางค์ของ {name} • USD',
  add_money: 'เติมเงิน',
  cash_summary: 'สรุปเงินสด',
  available_cash: 'เงินสดคงเหลือ',
  cash_in_transit: 'เงินที่กำลังโอน',
  recent_activity: 'กิจกรรมล่าสุด',
  see_all: 'ดูทั้งหมด',
  scan_qr: 'สแกนคิวอาร์ร้านค้า',
  point_camera: 'หันกล้องไปที่คิวอาร์โค้ด',
  confirm_payment: 'ยืนยันการชำระเงิน',
  merchant: 'ร้านค้า',
  amount: 'จำนวน',
  country: 'ประเทศ',
  place_name: 'สถานที่',
  wallet: 'วอลเล็ต',
  points: 'พอยท์',
  confirm_pay: 'ยืนยันชำระ',
  back: 'กลับ',
  payment_successful: 'ชำระเงินสำเร็จ',
  method: 'วิธี',
  tx_hash: 'Tx Hash',
  utilities: 'เครื่องมือ',
  streak_zero: 'สตรีค: 0 วัน',
  points_balance: 'ยอด JetSet Points',
  add_points: 'เพิ่มพอยท์',
  tier: 'เลเวล',
  conversion_chip: '1,000 JP = 1 {currency}',
  visited_countries: 'ประเทศที่เคยไป',
  badges: 'แบดจ์',
  where_use_title: 'คุณจะใช้ JetSet ที่ไหน?',
  where_use_subtitle: 'เลือกประเทศที่ต้องการให้แอปแสดงผล สามารถเปลี่ยนได้ทุกเวลา',
  choose_language_title: 'เลือกภาษาของคุณ',
  choose_language_subtitle: 'เลือกภาษาสำหรับ JetSet',
  continue_btn: 'ดำเนินการต่อ',
  save_btn: 'บันทึก',
};

const dicts: Record<string, Dict> = { en, hi, id, th };

export function t(key: I18nKey, lang: Lang, params?: Record<string, string | number>) {
  const dict = dicts[lang] || dicts['en'];
  let str = (dict[key] || dicts['en'][key]) as string;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(new RegExp(`{${k}}`, 'g'), String(v));
    }
  }
  return str;
} 