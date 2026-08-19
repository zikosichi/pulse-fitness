/* =========================================================================
   All site copy, both languages, in one place.

   Structure follows the Paper artboard "Pulse Fitness — Single Page (Light)".
   Palette/skin follows Brand & Identity/Visual Direction.md (dark cover,
   light body, dark close).

   Georgian is the source of truth — it came from the gym. Anything marked
   `draft: true` was written during the build and needs a human pass.

   Where Paper used invented figures (40+ classes/week, 100% community
   energy, "Free InBody scan", guest passes), they are replaced here with
   facts we can actually stand behind. See README.
   ========================================================================= */

export type Lang = "ka" | "en";
export type Bi = { ka: string; en: string };

export const pick = (l: Lang, b: Bi) => b[l];

export const nav: { href: string; label: Bi }[] = [
  { href: "#about", label: { ka: "შესახებ", en: "About" } },
  { href: "#offer", label: { ka: "სერვისები", en: "Services" } },
  { href: "#trainers", label: { ka: "მწვრთნელები", en: "Trainers" } },
  { href: "#membership", label: { ka: "ფასები", en: "Pricing" } },
  { href: "#contact", label: { ka: "კონტაქტი", en: "Contact" } },
];

export const ui = {
  call: { ka: "დარეკე", en: "Call" },
  viewClasses: { ka: "ნახე ვარჯიშები", en: "View classes" },
  openMaps: { ka: "რუკაზე გახსნა", en: "Open in maps" },
  fullBio: { ka: "სრული ბიო", en: "View full profile" },
  less: { ka: "დახურვა", en: "Close" },
  bookSession: { ka: "დაჯავშნე ვარჯიში", en: "Book a session" },
  menu: { ka: "მენიუ", en: "Menu" },
  skip: { ka: "გადადი კონტენტზე", en: "Skip to content" },
  soon: { ka: "მალე", en: "soon" },
  openHours: { ka: "ღიაა 08:00–23:00", en: "Open 8am–11pm" },
  address: { ka: "მისამართი", en: "Address" },
  hours: { ka: "სამუშაო საათები", en: "Hours" },
  phone: { ka: "ტელეფონი", en: "Phone" },
  everyDay: { ka: "ორშ–კვი · 08:00–23:00", en: "Mon–Sun · 8am–11pm" },
  alsoAvailable: { ka: "ასევე ხელმისაწვდომია", en: "Also available" },
  withTrainer: { ka: "მწვრთნელთან ერთად", en: "With a trainer" },
  groupPricing: { ka: "ჯგუფური ვარჯიშები", en: "Group classes" },
  phonePlaceholder: { ka: "[ტელეფონის ნომერი]", en: "[phone number]" },
  addressPlaceholder: { ka: "[მისამართი]", en: "[address]" },
  socialsPlaceholder: { ka: "[სოციალური ქსელები]", en: "[social links]" },
  mapPlaceholder: { ka: "Google Maps ჩაშენება", en: "Google Maps embed" },
  credPlaceholder: { ka: "[კვალიფიკაცია]", en: "[credential line]" },

  /* hero */
  eyebrow: { ka: "წყალტუბოს პირველი სპორტდარბაზი", en: "Tskaltubo's first gym" },
  open: { ka: "ღიაა", en: "Open" },
  price: { ka: "ფასი", en: "From" },
  fromPrice: { ka: "120 ₾-დან", en: "120 ₾" },
  city: { ka: "წყალტუბო", en: "Tskaltubo" },

  /* venue */
  visualisation: { ka: "ვიზუალიზაცია", en: "Visualisation" },
  prevSlide: { ka: "წინა", en: "Previous" },
  nextSlide: { ka: "შემდეგი", en: "Next" },
  upNext: { ka: "შემდეგი", en: "up next" },

  /* elsewhere */
  seePrices: { ka: "ფასები 120 ₾-დან →", en: "Prices from 120 ₾ →" },
  plusCode: { ka: "Plus Code", en: "Plus Code" },
  mapActivate: { ka: "შეეხე რუკის გასააქტიურებლად", en: "Tap to explore the map" },
} satisfies Record<string, Bi>;

/** The merch line. Latin in both languages — it works as a mark. */
export const MARK = "EVERY REP COUNTS";

/* ------------------------------------------------------------ 01 hero */

/* The logo mark carries the headline on the plate, so there is no H1 text
   here — the wordmark image is the H1. */
export const hero = {
  sub: {
    ka: "ივარჯიშე თანამედროვე სივრცეში, პროფესიონალ მწვრთნელებთან ერთად და მიაღწიე შენს მიზნებს — აქვე, წყალტუბოში.",
    en: "Train in a modern space with professional coaches and reach your goals — right here in Tskaltubo.",
  },
  draft: true,
};

/* ----------------------------------------------------------- 02 proof */
/* Every figure here is one we can stand behind, and each one carries its
   own kind of evidence rather than asserting a bare number. */

export const proof = {
  first: {
    figure: "#1",
    label: { ka: "სპორტდარბაზი წყალტუბოში", en: "Gym in Tskaltubo" },
    note: { ka: "და ჯერჯერობით ერთადერთი", en: "and so far the only one" },
  },
  trainers: {
    figure: "4",
    // "certified" is deliberately not claimed: we have documented credentials
    // for Lasha and Guga only. Change once Mano and Bela are confirmed.
    label: { ka: "მწვრთნელი", en: "Trainers" },
  },
  classes: {
    figure: "6",
    label: { ka: "ჯგუფური ვარჯიში", en: "Group classes" },
  },
  hours: {
    figure: "15",
    label: { ka: "საათი, ყოველ დღე", en: "Hours, every day" },
    detail: "08:00 – 23:00",
  },
};

/* ----------------------------------------------------------- 03 about */

export const about = {
  title: {
    ka: "წყალტუბოსთვის შექმნილი",
    en: "Built for this town",
  },
  body: [
    {
      ka: "Pulse უბრალოდ წყალტუბოში გახსნილი დარბაზი არ არის — ის წყალტუბოსთვის შეიქმნა. თანამედროვე სივრცე, პროფესიონალი მწვრთნელები და ყველა პირობა იმისთვის, რომ ივარჯიშო, გაძლიერდე და საკუთარ მიზნებს მიუახლოვდე.",
      en: "Pulse started with a simple idea: Tskaltubo deserved a modern place to move, sweat, and belong. No intimidation, no ego — just great equipment, real coaching, and a crew that shows up for each other.",
    },
    {
      ka: "აქ ყველა თავისიანია — მნიშვნელობა არ აქვს, პირველად იწყებ ვარჯიშს თუ დიდი გამოცდილება გაქვს. ეს შენი ქალაქია. ეს შენი დარბაზია.",
      en: "Whether it's your first session or your five-hundredth, you'll find the same welcome at the door.",
    },
  ],
  promiseMark: "EVERY REP COUNTS",
  /* Set across the city photo as live text in ALK Katerina, not baked into
     the image. If you change either string, retune --city-w in globals.css
     — the size constant is per-string. */
  place: { ka: "წყალტუბო", en: "TSKALTUBO" },
  draft: true,
};

/* ----------------------------------------------------------- 04 offer */

/* A numbered list, not cards. The last item is the one that carries the
   accent numeral and the opening hours. */
export type OfferItem = { title: Bi; body: Bi; hours?: string; mark?: boolean };

export const offer = {
  title: { ka: "ივარჯიშე შენებურად", en: "Train your way" },
  items: [
    {
      title: { ka: "ძალა", en: "Strength" },
      body: {
        ka: "თავისუფალი წონების ზონა, რექები და ტრენაჟორები. ააშენე ძალა მწვრთნელის მეთვალყურეობით.",
        en: "Full free-weight zone, racks, and machines. Build power with coached lifting programs.",
      },
    },
    {
      title: { ka: "კარდიო", en: "Cardio" },
      body: {
        ka: "ბილიკები, ველოსიპედები და ნიჩბები. იმოძრავე სწრაფად, ისუნთქე ღრმად.",
        en: "Treadmills, bikes and rowers. Move fast, breathe hard, feel unstoppable.",
      },
    },
    {
      title: { ka: "ჯგუფური", en: "Classes" },
      body: {
        ka: "აერობიკა, პილატესი, ბოქსი, კიკბოქსი და სხვა — ექვსი ტიპის ვარჯიში, ნამდვილ მწვრთნელებთან.",
        en: "Aerobics, pilates, boxing, kickboxing and more — six class types, with real coaches.",
      },
    },
    {
      title: { ka: "ღია დარბაზი", en: "Open gym" },
      body: {
        ka: "შენი სივრცე, შენი გრაფიკი. სრული წვდომა დილიდან ღამემდე, ყოველ დღე.",
        en: "Your space, your schedule. Full floor access from early morning to late night, every day.",
      },
      hours: "08:00 – 23:00",
      mark: true,
    },
  ] satisfies OfferItem[],
  draft: true,
};

/* -------------------------------------------------------- 05 trainers */

/* The two figures across the foot of each card. `v` stays untranslated —
   they are years, ranks and academy names. */
export type TrainerStat = { v: string; k: Bi };

export type Trainer = {
  id: string;
  photo: string;
  name: Bi;
  /** Doubles as the badge over the photo, so keep it short. */
  role: Bi;
  head?: boolean;
  specialty?: Bi;
  stats: [TrainerStat, TrainerStat];
  short?: Bi;
  bio?: Bi[];
  draft?: boolean;
};

export const trainersMeta = {
  title: { ka: "გაიცანი მწვრთნელები", en: "Meet your trainers" },
  lede: {
    ka: "ოთხი მწვრთნელი. შენზე მორგებული ვარჯიში.",
    en: "Four trainers. Training built around you.",
  },
};

export const trainers: Trainer[] = [
  {
    id: "lasha",
    photo: "/trainers/lasha.jpg",
    name: { ka: "ლაშა გიორხელიძე", en: "Lasha Giorkhelidze" },
    role: { ka: "მთავარი მწვრთნელი", en: "Head trainer" },
    head: true,
    specialty: { ka: "ძალა · სპორტული მომზადება", en: "Strength · Athletic prep" },
    stats: [
      { v: "2002", k: { ka: "წლიდან", en: "since" } },
      { v: "I", k: { ka: "დანი · ტაეკვონდო", en: "Dan · Taekwondo" } },
    ],
    short: {
      ka: "მწვრთნელი 2002 წლიდან. ტაეკვონდოს ყოფილი ეროვნული ნაკრების კაპიტანი, დღეს ძიუდოისტების ფიზიკური მომზადების მწვრთნელი.",
      en: "Coaching since 2002. Former taekwondo national-team captain, now conditioning judokas and athletes.",
    },
    bio: [
      {
        ka: "2002 წლიდან ვარ მწვრთნელი. ფიტნეს კლუბში ვიმუშავე 2011 წლამდე. ბოლო 6 წელია ოფიციალურად ვმუშაობ ძიუდოისტების ფიზიკური მომზადების მწვრთნელად, ზოგჯერ კლასიკოსებსა და მოჭიდავეებსაც ვეხმარები. ვიყავი წყალტუბოს რაგბის გუნდის ფიზიკური მომზადების მწვრთნელი. მაქვს პირადი მწვრთნელის სოლიდური გამოცდილება.",
        en: "I have been a coach since 2002. I worked in a fitness club until 2011. For the last six years I have officially worked as a strength and conditioning coach for judo athletes, and I also help classical wrestlers. I was the fitness coach for the Tskaltubo rugby team. I have solid experience as a personal trainer.",
      },
      {
        ka: "ჩემი საბაზო სპორტი ტაეკვონდო იყო — დაახლოებით 20 წელი ვივარჯიშე, 7 წელი საქართველოს ნაკრებში, კაპიტანიც ვიყავი. მაქვს პოსტ-ოპერაციული რეაბილიტაციის გამოცდილება: წელიწადში მინიმუმ 3–4 შემთხვევა, 100% წარმატებით. მიყვარს ჩემი საქმე და განსაკუთრებით მსიამოვნებს სპორტსმენებთან მუშაობა.",
        en: "My base sport was taekwondo — I trained for around 20 years, spent 7 of them on the Georgian national team, and was captain. I have experience with post-operative rehabilitation: at least 3–4 cases a year, all successful. I love my work, and I especially enjoy working with athletes.",
      },
    ],
  },
  {
    id: "guga",
    photo: "/trainers/guga.jpg",
    name: { ka: "გუგა აფხაძე", en: "Guga Apkhadze" },
    role: { ka: "სერტიფიცირებული", en: "Certified" },
    specialty: { ka: "სხეულის შემადგენლობა · ფიტნესი", en: "Body recomposition · Fitness" },
    stats: [
      { v: "3", k: { ka: "წელი", en: "years" } },
      { v: "MATA", k: { ka: "აკადემია", en: "Academy" } },
    ],
    short: {
      ka: "MATA Academy-ის სერტიფიცირებული მწვრთნელი. სამი წელი, რომელმაც დისციპლინა და პირადი პროგრამები ხილულ შედეგად აქცია.",
      en: "MATA Academy certified. Three years turning discipline and personal programs into real, visible results.",
    },
    bio: [
      {
        ka: "უკვე 3 წელია ფიტნესი ჩემი ცხოვრების განუყოფელი ნაწილია. ამ პერიოდში დავაგროვე პრაქტიკული გამოცდილებაც და პროფესიული ცოდნაც, რომელიც MATA Academy-ის პერსონალური ტრენერის კურსზე მივიღე. მჯერა, რომ სწორი ვარჯიში, დისციპლინა და ინდივიდუალური მიდგომა წარმატების მთავარი საფუძველია.",
        en: "Fitness has been an inseparable part of my life for three years now. In that time I have built both hands-on experience and professional knowledge, gained on the personal trainer course at MATA Academy. I believe correct training, discipline and an individual approach are the foundation of success.",
      },
      {
        ka: "ჩემი მიზანია, თითოეულ კლიენტს დავეხმარო მიზნის მიღწევაში — კუნთოვანი მასის ზრდაში, ცხიმის შემცირებაში, ფორმის გაუმჯობესებასა და ჯანსაღი ცხოვრების წესის ჩამოყალიბებაში. განსაკუთრებულ ყურადღებას ვუთმობ სწორ ტექნიკას, უსაფრთხოებასა და თითოეულის შესაძლებლობებზე მორგებულ პროგრამას.",
        en: "My goal is to help every client reach their own goal — building muscle, reducing fat, improving condition and establishing a healthy way of life. I pay particular attention to correct technique, safety, and a programme fitted to each person's ability.",
      },
    ],
  },
  {
    // Identity confirmed 2026-08-17 by the client-supplied filenames
    // (mano-gym-v2.png / bela-gym-v2.png). No longer an assumption.
    id: "mano",
    photo: "/trainers/mano.jpg",
    name: { ka: "მანო ქუთათელაძე", en: "Mano Kutateladze" },
    role: { ka: "მწვრთნელი", en: "Trainer" },
    specialty: { ka: "პირადი ვარჯიში", en: "Personal training" },
    stats: [
      { v: "1:1", k: { ka: "ინდივიდუალური", en: "one to one" } },
      { v: "8–12", k: { ka: "ვარჯიშის პაკეტი", en: "session packs" } },
    ],
    draft: true,
  },
  {
    id: "bela",
    photo: "/trainers/bela.jpg",
    name: { ka: "ბელა სალუქვაძე", en: "Bela Salukvadze" },
    role: { ka: "ჯგუფური ვარჯიშები", en: "Group classes" },
    specialty: { ka: "კარდიო კიკბოქსი · აერობიკა", en: "Cardio kickboxing · Aerobics" },
    stats: [
      { v: "3", k: { ka: "ვარჯიში", en: "classes" } },
      { v: "6", k: { ka: "ჯგუფი / კვირა", en: "groups / week" } },
    ],
    short: {
      ka: "უძღვება კარდიო კიკბოქსს, აერობიკასა და კალი-ლიბიდო ფლოუს.",
      en: "Leads our cardio kickboxing, aerobics and Kali-Libido Flow classes.",
    },
  },
];

/* --------------------------------------------------- 06 group classes */

export const groupMeta = {
  title: { ka: "ჯგუფური ვარჯიშები", en: "Group classes" },
  lede: {
    ka: "ექვსი ვარჯიში. ყველა ტემპისთვის.",
    en: "Six classes. Every pace welcome.",
  },
};

/* `who` names the trainer who leads the class, and is the only reason a
   chip appears on a tile. Only Bela's three are confirmed. */
export type ClassItem = { name: Bi; body: Bi; photo: string; who?: Bi; draft?: boolean };

export const classes: ClassItem[] = [
  {
    name: { ka: "აერობიკა", en: "Aerobics" },
    body: {
      ka: "რიტმული კარდიო მუსიკაზე — დაწვი ცხიმი და აიმაღლე ენერგია.",
      en: "Rhythmic cardio to music — burn fat and lift your energy.",
    },
    photo: "/classes/aerobics.jpg",
    who: { ka: "ბელა სალუქვაძე", en: "Bela Salukvadze" },
  },
  {
    name: { ka: "პილატესი", en: "Pilates" },
    body: {
      ka: "ბირთვის სიძლიერე, კონტროლი და მოქნილობა — დაბალი დატვირთვა, მაღალი შედეგი.",
      en: "Core strength, control and mobility — low impact, high payoff.",
    },
    photo: "/classes/pilates.jpg",
    draft: true,
  },
  {
    name: { ka: "ბოქსი", en: "Boxing" },
    body: {
      ka: "ტექნიკა, ძალა და სერიოზული მომზადება ტომარასთან.",
      en: "Technique, power and serious conditioning on the bag.",
    },
    photo: "/classes/boxing.jpg",
    draft: true,
  },
  {
    name: { ka: "კიკბოქსი", en: "Kickboxing" },
    body: {
      ka: "დარტყმები და ფეხის მუშაობა სრული სხეულის ძალისა და სისწრაფისთვის.",
      en: "Strikes and footwork for full-body power and speed.",
    },
    photo: "/classes/kickboxing.jpg",
    draft: true,
  },
  {
    name: { ka: "კარდიო კიკბოქსი", en: "Cardio kickboxing" },
    body: {
      ka: "მაღალი ინტენსივობის, უკონტაქტო ცხიმის დამწვავი რიტმზე.",
      en: "High-intensity, no-contact fat burner set to a beat.",
    },
    photo: "/classes/cardio-kickboxing.jpg",
    who: { ka: "ბელა სალუქვაძე", en: "Bela Salukvadze" },
  },
  {
    name: { ka: "კალი-ლიბიდო ფლოუ", en: "Kali-Libido Flow" },
    body: {
      ka: "ქალის მედიტაცია და მოძრაობა ენერგიისა და ბალანსისთვის.",
      en: "Women's meditation and movement for energy and balance.",
    },
    photo: "/classes/kali.jpg",
    who: { ka: "ბელა სალუქვაძე", en: "Bela Salukvadze" },
  },
];

/* ----------------------------------------------------------- 04 venue */

/* Every image in this carousel is a render of the finished room — the gym
   was still mid-renovation when they were made. That is why each slide
   carries the "ვიზუალიზაცია" tag; do not drop it until real photography
   replaces the renders. */
export const venue = {
  title: { ka: "სივრცე", en: "The space" },
  lede: {
    ka: "სამი ზონა. ერთი სრული დარბაზი.",
    en: "Three zones. One complete gym.",
  },
  slides: [
    { photo: "/space/venue-hall.jpg", title: { ka: "სავარჯიშო დარბაზი", en: "Training hall" } },
    { photo: "/space/venue-functional.jpg", title: { ka: "ფუნქციური ზონა", en: "Functional zone" } },
    { photo: "/space/venue-boxing.jpg", title: { ka: "ბოქსის ზონა", en: "Boxing zone" } },
  ],
};

/* ---------------------------------------------------------- ribbons */
/* Two crossed bands between pricing and contact. Phrases repeat because
   the bands scroll; the list is duplicated in the markup for the loop. */

export const ribbons = {
  green: [
    { text: { ka: "EVERY REP COUNTS", en: "EVERY REP COUNTS" }, latin: true },
    { text: { ka: "შენი ქალაქი. შენი დარბაზი.", en: "Your city. Your gym." } },
    { text: { ka: "EVERY REP COUNTS", en: "EVERY REP COUNTS" }, latin: true },
    { text: { ka: "ძალა აქ იწყება", en: "Strength starts here" } },
  ],
  mid: [
    { ka: "წყალტუბოსთვის შექმნილი", en: "Built for Tskaltubo" },
    { ka: "შენს ტემპში", en: "At your pace" },
    { ka: "ერთად უფრო ძლიერები", en: "Stronger together" },
    { ka: "ყოველდღე 08:00–23:00", en: "Open daily 08:00–23:00" },
  ] satisfies Bi[],
};

/* ------------------------------------------------------ 08 membership */

export type Plan = {
  name: Bi;
  price: number;
  unit: Bi;
  blurb: Bi;
  features: Bi[];
  cta: Bi;
  featured?: boolean;
};

export const membership = {
  title: { ka: "აირჩიე შენი ტემპი", en: "Pick your pace" },
  lede: {
    ka: "დამალული ფასები არ გვაქვს. აი, სრული სია.",
    en: "No hidden prices. Here is the whole list.",
  },
  mostPopular: { ka: "ყველაზე პოპულარული", en: "Most popular" },
  plans: [
    {
      name: { ka: "ერთჯერადი", en: "Drop-in" },
      price: 20,
      unit: { ka: "₾ / დღე", en: "GEL / day" },
      blurb: {
        ka: "მხოლოდ გამოივლი? აიღე ერთდღიანი და ისარგებლე სრული დარბაზით.",
        en: "Just visiting? Grab a single-day pass and use the full floor.",
      },
      features: [
        { ka: "სრული დარბაზი", en: "Full floor access" },
        { ka: "საშხაპე და საკეტი", en: "Locker & showers" },
      ],
      cta: { ka: "ერთდღიანი", en: "Get day pass" },
    },
    {
      name: { ka: "თვიური", en: "Monthly" },
      price: 120,
      unit: { ka: "₾ / თვე", en: "GEL / month" },
      blurb: {
        ka: "ოქროს შუალედი — შეუზღუდავი ვარჯიში მთელი თვის განმავლობაში.",
        en: "The sweet spot — unlimited training, all month long.",
      },
      features: [
        { ka: "შეუზღუდავი წვდომა დარბაზზე", en: "Unlimited gym access" },
        { ka: "საშხაპე და საკეტი", en: "Locker & showers" },
        { ka: "ჯგუფური ვარჯიშები ცალკე ფასად", en: "Group classes priced separately" },
      ],
      cta: { ka: "დაიწყე", en: "Start monthly" },
      featured: true,
    },
    {
      name: { ka: "წლიური", en: "Annual" },
      price: 1000,
      unit: { ka: "₾ / წელი", en: "GEL / year" },
      blurb: {
        ka: "სრულად ჩაერთე და დაზოგე. ყველაზე დაბალი თვიური ფასი.",
        en: "Go all-in and save. The lowest monthly rate we offer.",
      },
      features: [
        { ka: "ყველაფერი, რაც თვიურში", en: "Everything in Monthly" },
        { ka: "12 თვე", en: "12 months" },
      ],
      cta: { ka: "წლიური", en: "Go annual" },
    },
  ] satisfies Plan[],
  also: [
    { label: { ka: "1 კვირა", en: "1 week" }, price: 50 },
    { label: { ka: "2 კვირა", en: "2 weeks" }, price: 80 },
    { label: { ka: "3 თვე", en: "3 months" }, price: 300 },
    { label: { ka: "6 თვე", en: "6 months" }, price: 550 },
    { label: { ka: "თვეში 12 ვიზიტი", en: "12 visits / mo" }, price: 100 },
  ],
  trainer: [
    { label: { ka: "8 ვარჯიში", en: "8 sessions" }, price: 120 },
    { label: { ka: "12 ვარჯიში", en: "12 sessions" }, price: 150 },
    { label: { ka: "ინდივიდუალური 12", en: "Individual 12" }, price: 200 },
  ],
  group: [
    { label: { ka: "აერობიკა / პილატესი", en: "Aerobics / Pilates" }, price: 120, withGym: 180 },
    { label: { ka: "ბოქსი / კიკბოქსი", en: "Boxing / Kickboxing" }, price: 150, withGym: 200 },
  ],
  groupNote: {
    ka: "ჯგუფური — 12 ვარჯიში. მეორე ფასი აბონემენტთან ერთად.",
    en: "Group classes are 12 sessions. Second price is with a gym membership.",
  },
  fine: {
    ka: "ბარათი 5 ₾ · სამაჯური 10 ₾ (ერთჯერადი)",
    en: "Access card 5 ₾ · Wristband 10 ₾ (one-time)",
  },
};

/* --------------------------------------------------------- 09 contact */

export const contact = {
  title: { ka: "შემოგვიარე წყალტუბოში", en: "Come say hi in Tskaltubo" },
  cta: { ka: "დარეკე და მოდი", en: "Call and come in" },
  /* Shown while there is no real phone number, so the shape of what is
     missing is visible rather than the field just vanishing. */
  phoneMask: "+995 ___ __ __ __",
};

export const footer = {
  place: { ka: "წყალტუბო, საქართველო", en: "Tskaltubo, Georgia" },
  tagline: { ka: "წყალტუბოს პირველი სპორტდარბაზი", en: "Tskaltubo's first gym" },
};

export const HOURS = "08:00 – 23:00";
export const LARI = "₾";
