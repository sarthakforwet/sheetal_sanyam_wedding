// ─────────────────────────────────────────────────────────────────────────────
// Wedding configuration — the single source of truth for site content.
//
// Every user-facing text field is { en, hi }. Programme, venue, dress code,
// family and contact details come from the family's invitation website.
// All times are IST (+05:30).
// ─────────────────────────────────────────────────────────────────────────────

const IST = '+05:30';
const at = (date, time) => `${date}T${time}:00${IST}`;
const photo = (n) => ({ src: `/img/photos/p${n}.webp`, thumb: `/img/photos/p${n}-sm.webp` });

// Pastel Carnival: the dress code for the Haldi Carnival only. Every other
// function has no dress code.
const PASTEL = {
  title: { en: 'Pastel Carnival', hi: 'पेस्टल कार्निवल' },
  note: {
    en: 'Carnival theme in pastel colours: lavender for women, peach for men. Pearls and soft pastels welcome.',
    hi: 'पेस्टल रंगों में कार्निवल थीम: महिलाओं के लिए लैवेंडर, पुरुषों के लिए पीच। मोती और हल्के पेस्टल रंगों का स्वागत है।',
  },
  women: { en: 'Lavender outfits: lehengas, sarees or suits', hi: 'लैवेंडर परिधान: लहंगा, साड़ी या सूट' },
  men: { en: 'Peach outfits: kurtas, sherwanis or bandhgalas', hi: 'पीच परिधान: कुर्ता, शेरवानी या बंदगला' },
  palette: ['#B9A4E6', '#D9CBF5', '#F8BFA2', '#FFE3D4', '#F6EEE2'],
};

export default {
  couple: {
    partner1: { en: 'Sanyam', hi: 'संयम' },
    partner2: { en: 'Sheetal', hi: 'शीतल' },
    monogram: 'S&S',
    names: { en: 'Sanyam & Sheetal', hi: 'संयम और शीतल' },
  },
  hashtag: '#SHYAMsaverewithu',
  city: { en: 'Indore', hi: 'इंदौर' },
  dateRange: { en: '2nd & 3rd December 2026', hi: '2 और 3 दिसंबर 2026' },
  timezone: 'Asia/Kolkata',
  languages: ['en', 'hi'],
  defaultLanguage: 'en',

  // Whether search engines may index the site. Off by default: guests reach it
  // through the shared link, and a family wedding site is best kept out of search.
  indexable: false,

  // The event the hero countdown points at
  mainEventId: 'baraat',

  invitation: {
    blessing: { en: '॥ श्री गणेशाय नमः ॥', hi: '॥ श्री गणेशाय नमः ॥' },
    line: {
      en: 'With the blessings of the Almighty and our elders, we joyfully invite you and your family to the wedding of',
      hi: 'ईश्वर और बड़ों के आशीर्वाद से, हम आपको सपरिवार इस शुभ विवाह में सादर आमंत्रित करते हैं',
    },
    hosts: {
      en: 'Son of Shri Shivshankar Badgoti & Smt. Samta Badgoti',
      hi: 'सुपुत्र श्री शिवशंकर बडगोती एवं श्रीमती समता बडगोती',
    },
    signoff: { en: 'With love, Badgoti family', hi: 'सप्रेम, बडगोती परिवार' },
  },

  // Photos from the pre-wedding shoot
  photos: {
    hero: [
      { ...photo('01'), alt: { en: 'Sanyam twirling Sheetal at a red stone archway', hi: 'लाल पत्थर के मेहराब में शीतल को घुमाते संयम' } },
      { ...photo('02'), alt: { en: 'Sanyam showering petals on Sheetal', hi: 'शीतल पर फूल बरसाते संयम' } },
      { ...photo('03'), alt: { en: 'Sanyam and Sheetal at a carved temple doorway', hi: 'नक़्क़ाशीदार मंदिर द्वार पर संयम और शीतल' } },
      { ...photo('04'), alt: { en: 'Sanyam lifting Sheetal on a hilltop', hi: 'पहाड़ी पर शीतल को उठाए संयम' } },
    ],
    venue: { ...photo('11'), alt: { en: 'Sheetal smiling at Sanyam by an arched window', hi: 'मेहराबदार खिड़की के पास संयम को देखकर मुस्कुराती शीतल' } },
    finale: { ...photo('15'), alt: { en: 'Silhouette of Sanyam and Sheetal', hi: 'संयम और शीतल की छाया-छवि' } },
    // Shown on WhatsApp link previews (run `npm run og` after changing)
    og: '/img/photos/p03.webp',
  },

  // Background music (off until a guest taps the speaker button). Put the
  // instrumental at this path; if the file is missing, the button plays a soft
  // built-in tanpura drone instead.
  music: { src: '/audio/tere-naina-instrumental.mp3' },

  // Number behind every "WhatsApp the family" link and the concierge fallback
  coordinator: {
    name: { en: 'the Badgoti family', hi: 'बडगोती परिवार' },
    whatsapp: '+919406623152',
  },
  // "For any queries" numbers, shown with Call / WhatsApp buttons
  contacts: ['+919406623152', '+919407147850'],
  // RSVPs open WhatsApp with a prefilled message to this number
  rsvp: { whatsapp: '+919406623152' },

  location: { lat: 22.6766, lng: 75.8789 },
  weather: {
    typical: {
      highC: 28,
      lowC: 12,
      note: {
        en: 'Early December in Indore is dry and sunny with crisp evenings. Carry a shawl or light jacket for the night functions.',
        hi: 'दिसंबर की शुरुआत में इंदौर में मौसम सूखा और धूप भरा रहता है, शामें ठंडी होती हैं। रात के कार्यक्रमों के लिए शॉल या हल्की जैकेट साथ रखें।',
      },
    },
  },

  venues: {
    rk: {
      name: { en: 'Radha Krishna Marriage Resort', hi: 'राधाकृष्ण मैरिज रिसॉर्ट' },
      address: { en: '355/1, Pipliyarao, Ring Road, Indore, Madhya Pradesh', hi: '355/1, पिपलियाराव, रिंग रोड, इंदौर, मध्य प्रदेश' },
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Radha%20Krishna%20Marriage%20Resort%2C%20Pipliyarao%2C%20Ring%20Road%2C%20Indore',
      directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Radha%20Krishna%20Marriage%20Resort%2C%20Pipliyarao%2C%20Ring%20Road%2C%20Indore',
    },
  },

  events: [
    {
      id: 'haldi',
      name: { en: 'Haldi Carnival', hi: 'हल्दी कार्निवल' },
      tagline: { en: 'Haldi with colour and carnival fun', hi: 'रंग और कार्निवल की मस्ती के साथ हल्दी' },
      start: at('2026-12-02', '09:00'),
      end: at('2026-12-02', '12:00'),
      venue: 'rk',
      color: '#C9962E',
      tint: '#FBF0D6',
      icon: 'haldi',
      dress: PASTEL,
      ritual: {
        en: 'Family and friends apply a paste of turmeric to the couple as a blessing for a glowing new beginning. Ours comes with colour, music and carnival games, so wear something you don’t mind getting a little yellow!',
        hi: 'परिवार और मित्र दूल्हा-दुल्हन को हल्दी का लेप लगाकर नई शुरुआत का आशीर्वाद देते हैं। हमारी हल्दी में रंग, संगीत और कार्निवल के खेल होंगे, इसलिए ऐसे कपड़े पहनें जिन पर थोड़ा पीला रंग लगने से फ़र्क न पड़े!',
      },
    },
    {
      id: 'sagai',
      name: { en: 'Sagai Tika', hi: 'सगाई टीका' },
      tagline: { en: 'Engagement ceremony', hi: 'सगाई की रस्म' },
      start: at('2026-12-02', '13:00'),
      end: at('2026-12-02', '15:00'),
      venue: 'rk',
      color: '#9E1622',
      tint: '#F9E3E1',
      icon: 'ring',
      ritual: {
        en: 'The engagement ceremony. The bride’s family applies the tika to the groom, and the two families exchange blessings and gifts, formally sealing the bond.',
        hi: 'सगाई की रस्म। वधू पक्ष वर को टीका लगाता है और दोनों परिवार आशीर्वाद व उपहारों का आदान-प्रदान कर रिश्ते को पक्का करते हैं।',
      },
    },
    {
      id: 'sangeet',
      name: { en: 'Sangeet Night', hi: 'संगीत संध्या' },
      tagline: { en: 'An evening of music and dance', hi: 'संगीत और नृत्य की शाम' },
      start: at('2026-12-02', '19:00'),
      end: at('2026-12-02', '23:30'),
      venue: 'rk',
      color: '#5B3FA8',
      tint: '#ECE6F8',
      icon: 'sangeet',
      ritual: {
        en: 'Both families come together for an evening of music, dance performances and dinner.',
        hi: 'दोनों परिवार संगीत, नृत्य प्रस्तुतियों और रात्रिभोज की एक शाम के लिए एक साथ आते हैं।',
      },
    },
    {
      id: 'bhaat',
      name: { en: 'Bhaat', hi: 'भात' },
      tagline: { en: 'Bhaat ceremony', hi: 'भात की रस्म' },
      start: at('2026-12-03', '07:30'),
      end: at('2026-12-03', '09:00'),
      venue: 'rk',
      color: '#7C63C4',
      tint: '#EEE8FA',
      icon: 'gift',
      ritual: {
        en: 'The maternal uncles (mama) and their family arrive with gifts of clothes, jewellery and blessings, standing beside their sister at her child’s wedding. An emotional, joyful tradition.',
        hi: 'मामा और उनका परिवार कपड़े, गहने और आशीर्वाद लेकर आते हैं और अपनी बहन की संतान की शादी में उसके साथ खड़े होते हैं। भावनाओं और ख़ुशी से भरी परंपरा।',
      },
    },
    {
      id: 'baraat',
      name: { en: 'Baraat Welcome', hi: 'बारात स्वागत' },
      tagline: { en: 'Welcoming the wedding procession', hi: 'बारात का स्वागत' },
      start: at('2026-12-03', '09:00'),
      end: at('2026-12-03', '13:00'),
      venue: 'rk',
      color: '#D2774E',
      tint: '#FDE9DE',
      icon: 'baraat',
      ritual: {
        en: 'Sanyam’s baraat arrives with the dhol, dancing all the way to the gate, where Sheetal’s family welcomes the groom and his party with aarti, tilak and garlands.',
        hi: 'संयम की बारात ढोल के साथ नाचते-गाते द्वार तक पहुँचेगी, जहाँ शीतल का परिवार आरती, तिलक और मालाओं से दूल्हे और बारातियों का स्वागत करेगा।',
      },
    },
    {
      id: 'reception',
      name: { en: 'Reception & Dinner', hi: 'रिसेप्शन और रात्रिभोज' },
      tagline: { en: 'From 7 PM onwards', hi: 'शाम 7 बजे से' },
      start: at('2026-12-03', '19:00'),
      end: at('2026-12-03', '23:30'),
      venue: 'rk',
      color: '#5B0A12',
      tint: '#F3E2DE',
      icon: 'reception',
      ritual: {
        en: 'Celebrate the newly-weds at their reception and stay for dinner, served from 7 PM onwards.',
        hi: 'नवविवाहित जोड़े के रिसेप्शन में पधारकर उन्हें आशीर्वाद दें और रात्रिभोज का आनंद लें, जो शाम 7 बजे से उपलब्ध रहेगा।',
      },
    },
  ],

  // Programme items that aren't separate functions (shown in the day timeline)
  programmeExtras: [
    { time: at('2026-12-02', '12:00'), name: { en: 'Lunch', hi: 'दोपहर का भोजन' } },
  ],

  // Facts the concierge and the travel page draw on — keep them accurate
  travel: {
    sections: [
      {
        id: 'venue',
        title: { en: 'The venue', hi: 'आयोजन स्थल' },
        body: {
          en: 'Every function on both days is at Radha Krishna Marriage Resort, 355/1, Pipliyarao, Ring Road, Indore.',
          hi: 'दोनों दिनों के सभी कार्यक्रम राधाकृष्ण मैरिज रिसॉर्ट, 355/1, पिपलियाराव, रिंग रोड, इंदौर में होंगे।',
        },
      },
      {
        id: 'airport',
        title: { en: 'Flying in', hi: 'हवाई यात्रा' },
        body: {
          en: 'Indore’s Devi Ahilyabai Holkar Airport (IDR) is roughly 30–40 minutes from the venue by road, depending on traffic. Please share your arrival details with the family on WhatsApp.',
          hi: 'इंदौर का देवी अहिल्याबाई होल्कर हवाई अड्डा (IDR) ट्रैफ़िक के अनुसार स्थल से सड़क मार्ग से लगभग 30–40 मिनट दूर है। कृपया अपने आगमन की जानकारी परिवार को WhatsApp पर भेजें।',
        },
      },
      {
        id: 'train',
        title: { en: 'By train', hi: 'रेल यात्रा' },
        body: {
          en: 'Indore Junction (INDB) is roughly 30 minutes from the venue by road. Cabs and autos are easy to find outside the station.',
          hi: 'इंदौर जंक्शन (INDB) स्थल से सड़क मार्ग से लगभग 30 मिनट दूर है। स्टेशन के बाहर कैब और ऑटो आसानी से मिल जाते हैं।',
        },
      },
      {
        id: 'stay',
        title: { en: 'Where you’re staying', hi: 'ठहरने की व्यवस्था' },
        body: {
          en: 'If you need a room, please WhatsApp the family and they will share the details of your stay.',
          hi: 'यदि आपको ठहरने की व्यवस्था चाहिए, तो कृपया परिवार को WhatsApp करें, वे आपके ठहरने की जानकारी साझा करेंगे।',
        },
      },
      {
        id: 'indore',
        title: { en: 'Eat like an Indori', hi: 'इंदौरी स्वाद' },
        body: {
          en: 'Have a free morning? Try poha-jalebi at 56 Dukan, and the Sarafa night market comes alive after 9 pm with garadu, bhutte ka kees and malpua.',
          hi: 'सुबह खाली है? 56 दुकान का पोहा-जलेबी चखें, और रात 9 बजे के बाद सराफ़ा बाज़ार में गराडू, भुट्टे का कीस और मालपुआ।',
        },
      },
    ],
    faq: [
      {
        q: { en: 'What should I wear?', hi: 'क्या पहनें?' },
        a: { en: 'Only the Haldi Carnival has a theme, Pastel Carnival: lavender outfits for women and peach for men. For every other function there’s no dress code, so wear whatever you like.', hi: 'केवल हल्दी कार्निवल की थीम है, पेस्टल कार्निवल: महिलाओं के लिए लैवेंडर और पुरुषों के लिए पीच परिधान। बाक़ी सभी कार्यक्रमों में कोई ड्रेस कोड नहीं है, जो मन करे वो पहनें।' },
      },
      {
        q: { en: 'Is the food vegetarian?', hi: 'क्या भोजन शाकाहारी है?' },
        a: { en: 'Yes, all meals are pure vegetarian.', hi: 'हाँ, सारा भोजन शुद्ध शाकाहारी है।' },
      },
      {
        q: { en: 'When should I arrive for the Reception?', hi: 'रिसेप्शन में कब पहुँचें?' },
        a: { en: 'Any time from 7 PM onwards on 3rd December. Dinner is served from 7 PM.', hi: '3 दिसंबर को शाम 7 बजे के बाद कभी भी। रात्रिभोज शाम 7 बजे से उपलब्ध रहेगा।' },
      },
    ],
  },

  story: {
    intro: { en: 'Two hearts, one journey', hi: 'दो दिल, एक सफ़र' },
    // Captioned photo moments (add `year` and `body` to tell the story in words)
    timeline: [
      { image: photo('05').src, title: { en: 'The beginning', hi: 'शुरुआत' }, alt: { en: 'Sanyam and Sheetal at a stone arch', hi: 'पत्थर के मेहराब के पास संयम और शीतल' } },
      { image: photo('06').src, title: { en: 'That smile', hi: 'वो मुस्कान' }, alt: { en: 'Sanyam hugging Sheetal', hi: 'शीतल को गले लगाते संयम' } },
      { image: photo('07').src, title: { en: 'Hand in hand', hi: 'हाथों में हाथ' }, alt: { en: 'Sanyam and Sheetal holding hands', hi: 'हाथ थामे संयम और शीतल' } },
      { image: photo('08').src, title: { en: 'Peace', hi: 'सुकून' }, alt: { en: 'The couple by a waterfall', hi: 'झरने के पास जोड़ी' } },
      { image: photo('09').src, title: { en: 'Home', hi: 'घर' }, alt: { en: 'Sanyam kissing Sheetal’s forehead in a meadow', hi: 'घास के मैदान में शीतल का माथा चूमते संयम' } },
      { image: photo('10').src, title: { en: 'Waiting for you', hi: 'तुम्हारा इंतज़ार' }, alt: { en: 'Sheetal looking down at Sanyam on old steps', hi: 'पुरानी सीढ़ियों पर संयम को निहारती शीतल' } },
    ],
    gallery: [
      { ...photo('12'), caption: { en: 'Forever', hi: 'हमेशा' }, alt: { en: 'Sanyam and Sheetal forehead to forehead', hi: 'माथे से माथा मिलाए संयम और शीतल' } },
      { ...photo('13'), caption: { en: 'Free spirits', hi: 'आज़ाद परिंदे' }, alt: { en: 'The couple running on a green hill', hi: 'हरी पहाड़ी पर दौड़ती जोड़ी' } },
      { ...photo('14'), caption: { en: 'Together', hi: 'साथ-साथ' }, alt: { en: 'Sanyam and Sheetal walking arm in arm', hi: 'बाँहों में बाँहें डाले चलते संयम और शीतल' } },
      { ...photo('02'), caption: { en: 'Celebration', hi: 'जश्न' }, alt: { en: 'Sanyam showering petals on Sheetal', hi: 'शीतल पर फूल बरसाते संयम' } },
      { ...photo('04'), caption: { en: 'Joy', hi: 'ख़ुशी' }, alt: { en: 'Sanyam lifting Sheetal on a hilltop', hi: 'पहाड़ी पर शीतल को उठाए संयम' } },
      { ...photo('03'), caption: { en: 'Blessed', hi: 'आशीर्वाद' }, alt: { en: 'The couple at a carved doorway', hi: 'नक़्क़ाशीदार द्वार पर जोड़ी' } },
      { ...photo('01'), caption: { en: 'Dance', hi: 'नृत्य' }, alt: { en: 'Sanyam twirling Sheetal', hi: 'शीतल को घुमाते संयम' } },
      { ...photo('11'), caption: { en: 'Smiles', hi: 'मुस्कानें' }, alt: { en: 'Sheetal smiling at Sanyam by an arched window', hi: 'मेहराबदार खिड़की के पास मुस्कुराती शीतल' } },
    ],
  },

  // Who's who. Add photos with photo: '/img/family/<file>.jpg' (monogram avatars otherwise);
  // a family with no `about` or `members` is hidden.
  families: [
    {
      id: 'groom',
      title: { en: 'Sanyam’s family', hi: 'संयम का परिवार' },
      about: {
        en: 'The Badgoti family warmly invites you to celebrate with them in Indore.',
        hi: 'बडगोती परिवार आपको इंदौर में इस उत्सव में शामिल होने के लिए सादर आमंत्रित करता है।',
      },
      customs: {
        en: 'Look out for the Bhaat on the morning of 3rd December, when the mama’s family arrives bearing gifts and blessings, and the Baraat Welcome, when Sheetal’s family greets Sanyam and his baraat at the gate.',
        hi: '3 दिसंबर की सुबह भात देखिए, जब मामा का परिवार उपहार और आशीर्वाद लेकर आता है, और बारात स्वागत, जब शीतल का परिवार द्वार पर संयम और बारातियों का स्वागत करता है।',
      },
      members: [
        { name: { en: 'Shri Shivshankar Badgoti', hi: 'श्री शिवशंकर बडगोती' }, relation: { en: 'Father', hi: 'पिता' }, photo: '' },
        { name: { en: 'Smt. Samta Badgoti', hi: 'श्रीमती समता बडगोती' }, relation: { en: 'Mother', hi: 'माता' }, photo: '' },
      ],
    },
    {
      id: 'bride',
      title: { en: 'Sheetal’s family', hi: 'शीतल का परिवार' },
      about: null,
      customs: null,
      members: [
        { name: { en: 'Sapna Beemwal', hi: 'सपना बीमवाल' }, relation: { en: 'Mother', hi: 'माता' }, photo: '' },
        { name: { en: 'Subhash Chandra Beemwal', hi: 'सुभाष चंद्र बीमवाल' }, relation: { en: 'Father', hi: 'पिता' }, photo: '' },
      ],
    },
  ],

  thankYou: {
    // YouTube embed URL for the highlight film, e.g. https://www.youtube-nocookie.com/embed/<id>
    videoEmbed: '',
    message: {
      en: 'Thank you for dancing, blessing and celebrating with us through two unforgettable days. Your presence was our blessing.',
      hi: 'दो अविस्मरणीय दिनों में हमारे साथ नाचने, आशीर्वाद देने और जश्न मनाने के लिए धन्यवाद। आपकी उपस्थिति ही हमारा आशीर्वाद थी।',
    },
    // Optional link to the official photos (e.g. a Kwikpic / Samaro selfie-search
    // album or a Google Photos link); shown with a QR code once it's set
    photosLink: {
      url: '',
      label: { en: 'Find yourself in the official photos', hi: 'आधिकारिक फ़ोटो में ख़ुद को खोजें' },
    },
  },

};
