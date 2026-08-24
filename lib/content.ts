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
  book: { ka: "დაჯავშნე", en: "Book" },
  bookVisit: { ka: "დაჯავშნე ვიზიტი", en: "Book a visit" },
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
  email: { ka: "ელფოსტა", en: "Email" },
  everyDay: { ka: "ორშ–კვი · 08:00–23:00", en: "Mon–Sun · 8am–11pm" },
  alsoAvailable: { ka: "ასევე ხელმისაწვდომია", en: "Also available" },
  withTrainer: { ka: "პირადი მწვრთნელის სერვისი", en: "Personal trainer service" },
  groupPricing: { ka: "ჯგუფური ვარჯიშები", en: "Group classes" },
  phonePlaceholder: { ka: "[ტელეფონის ნომერი]", en: "[phone number]" },
  addressPlaceholder: { ka: "[მისამართი]", en: "[address]" },
  socialsPlaceholder: { ka: "[სოციალური ქსელები]", en: "[social links]" },
  mapPlaceholder: { ka: "Google Maps ჩაშენება", en: "Google Maps embed" },
  credPlaceholder: { ka: "[კვალიფიკაცია]", en: "[credential line]" },

  /* hero */
  eyebrow: { ka: "წყალტუბოს პირველი სპორტდარბაზი", en: "Tskaltubo's first gym" },
  open: { ka: "სამუშაო საათები", en: "Open" },
  training: { ka: "ვარჯიში", en: "Training" },
  trainingModes: { ka: "პირადი · ჯგუფური", en: "Personal · group" },
  city: { ka: "წყალტუბო", en: "Tskaltubo" },

  /* venue */
  visualisation: { ka: "ვიზუალიზაცია", en: "Visualisation" },
  prevSlide: { ka: "წინა", en: "Previous" },
  nextSlide: { ka: "შემდეგი", en: "Next" },
  upNext: { ka: "შემდეგი", en: "up next" },

  /* elsewhere */
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
    figure: "5",
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
    ka: "შექმნილია წყალტუბოსთვის",
    en: "Built for this town",
  },
  body: [
    {
      ka: "Pulse უბრალოდ წყალტუბოში გახსნილი დარბაზი არ არის — ის წყალტუბოსთვის შეიქმნა. თანამედროვე სივრცე, პროფესიონალი მწვრთნელები და ყველა პირობა იმისთვის, რომ ივარჯიშო, გაძლიერდე და საკუთარ მიზნებს მიუახლოვდე.",
      en: "Pulse started with a simple idea: Tskaltubo deserved a modern place to move, sweat, and belong. No intimidation, no ego — just great equipment, real coaching, and a crew that shows up for each other.",
    },
    {
      ka: "აქ ყველა შენიანია — მნიშვნელობა არ აქვს, პირველად იწყებ ვარჯიშს თუ დიდი გამოცდილება გაქვს. ეს შენი ქალაქია. ეს შენი დარბაზია.",
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
  title: { ka: "სავარჯიშო ზონები", en: "Training zones" },
  items: [
    {
      title: { ka: "ძალოვანი ზონა", en: "Strength zone" },
      body: {
        ka: "ჰანტელები, შტანგები, სკამები და ფეხების, მკერდის, ზურგისა და მხრების ტრენაჟორები.",
        en: "Dumbbells, barbells, benches, and dedicated machines for legs, chest, back, and shoulders.",
      },
    },
    {
      title: { ka: "კარდიო", en: "Cardio" },
      body: {
        ka: "სარბენი ბილიკები, ელიფსები და ველოტრენაჟორები გამძლეობისა და ენერგიისთვის.",
        en: "Treadmills, ellipticals, and exercise bikes for endurance and energy.",
      },
    },
    {
      title: { ka: "ფუნქციური და მობილობის ზონა", en: "Functional & mobility zone" },
      body: {
        ka: "TRX, თოკები, გირები, ბოქსები, რეზინები, იოგას მატები და გასაჭიმი ინვენტარი.",
        en: "TRX, battle ropes, kettlebells, plyo boxes, resistance bands, mats, and mobility equipment.",
      },
    },
    {
      title: { ka: "სამუშაო საათები", en: "Opening hours" },
      body: {
        ka: "სრული დარბაზი შენს განკარგულებაშია დილიდან ღამემდე, კვირაში შვიდი დღე.",
        en: "The full gym is available from morning until night, seven days a week.",
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
  /** Optional shorter label for the compact card; the profile keeps `role`. */
  cardRole?: Bi;
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
    ka: "ხუთი მწვრთნელი. შენზე მორგებული ვარჯიში.",
    en: "Five trainers. Training built around you.",
  },
};

export const trainers: Trainer[] = [
  {
    id: "lasha",
    photo: "/trainers/lasha.jpg",
    name: { ka: "ლაშა გიორხელიძე", en: "Lasha Giorkhelidze" },
    role: { ka: "მთავარი მწვრთნელი", en: "Head trainer" },
    head: true,
    specialty: { ka: "პერსონალური მწვრთნელი · ძალა · სპორტული მომზადება", en: "Personal trainer · Strength · Athletic prep" },
    stats: [
      { v: "2002", k: { ka: "წლიდან", en: "since" } },
      { v: "I", k: { ka: "დანი · ტაეკვონდო", en: "Dan · Taekwondo" } },
    ],
    short: {
      ka: "ძალა, გამძლეობა, მენტალური და ფსიქოლოგიური მდგრადობა.",
      en: "Strength, endurance, mental and psychological resilience.",
    },
    bio: [
      {
        ka: "2002 წლიდან ვარ მწვრთნელი. 2011 წლამდე ვმუშაობდი ფიტნეს კლუბში. ბოლო 6 წელია, ოფიციალურად ვმუშაობ ძიუდოისტების ფიზიკური მომზადების მწვრთნელად. ეტაპობრივად ვეხმარები კლასიკური სტილის მოჭიდავეებსაც ფიზიკური მომზადების მიმართულებით. ვიყავი წყალტუბოს რაგბის გუნდის ფიზიკური მომზადების მწვრთნელი. სხვადასხვა დროს წარმატებით ვმუშაობდი ცნობილ ქართველ ათლეტებთან, შესაბამისად, მაქვს პირადი მწვრთნელის საკმაოდ სოლიდური გამოცდილება.",
        en: "I have been a coach since 2002. Until 2011 I worked in a fitness club. For the last six years I have officially worked as a strength and conditioning coach for judo athletes, and I gradually help classical-style wrestlers with their physical preparation too. I was the strength and conditioning coach for the Tskaltubo rugby team. At various times I have worked successfully with well-known Georgian athletes, so I have solid experience as a personal trainer.",
      },
      {
        ka: "ჩემი მთავარი მიმართულებაა სპორტსმენის ფიზიკური შესაძლებლობების მაქსიმალურად განვითარება — ძალის, გამძლეობის, სისწრაფის, ფეთქებადობის, მენტალური და ფსიქოლოგიური მდგრადობის გაძლიერება. მაქვს პოსტოპერაციული რეაბილიტაციის მიმართულებით მუშაობის გამოცდილებაც — წელიწადში მინიმუმ 3–4 შემთხვევა, წარმატებული შედეგებით. მიყვარს ჩემი საქმე და განსაკუთრებით მსიამოვნებს სპორტსმენებთან მუშაობა. ჩემთვის მნიშვნელოვანია, თითოეულ სპორტსმენს ინდივიდუალური მიდგომით დავეხმარო საკუთარი შესაძლებლობების მაქსიმალურად გამოვლენასა და განვითარებაში.",
        en: "My main focus is developing an athlete's physical capacity to the fullest — building strength, endurance, speed, explosiveness, and mental and psychological resilience. I also have experience in post-operative rehabilitation — at least 3–4 cases a year, with successful results. I love my work and especially enjoy working with athletes. It matters to me to help each athlete, through an individual approach, reveal and develop their abilities to the maximum.",
      },
      {
        ka: "რაც შეეხება ჩემს სპორტულ კარიერას, საბაზისო სპორტს ტაეკვონდო წარმოადგენს, რომელშიც 20 წლის განმავლობაში ვვარჯიშობდი. 7 წლის განმავლობაში ვიყავი საქართველოს ეროვნული ნაკრების წევრი და გარკვეული პერიოდის განმავლობაში გუნდის კაპიტნის სტატუსსაც ვატარებდი. ვარ საქართველოს მრავალგზის ჩემპიონი და სხვადასხვა საერთაშორისო ტურნირების გამარჯვებული. 2000 წელს გავხდი ევროპის ვერცხლის პრიზიორი, ხოლო 2009 წელს — მსოფლიო ჩემპიონი. ჩემი სპორტული კარიერა ჩემთვის განსაკუთრებით მნიშვნელოვანი გამოცდილებაა, რადგან წლების განმავლობაში მიღებული ცოდნა და გამოცდილება დღეს მეხმარება სპორტსმენებთან მუშაობაში და მათი ფიზიკური, მენტალური და ფსიქოლოგიური შესაძლებლობების განვითარებაში.",
        en: "As for my own athletic career, my base sport is taekwondo, which I trained in for 20 years. For seven years I was a member of the Georgian national team, and for a period I held the status of team captain. I am a multiple Georgian champion and a winner of various international tournaments. In 2000 I took European silver, and in 2009 I became world champion. My sporting career is a particularly valuable experience for me, because the knowledge and experience I have gained over the years helps me today in working with athletes and developing their physical, mental and psychological abilities.",
      },
    ],
  },
  {
    // Identity confirmed 2026-08-17 by the client-supplied filenames
    // (mano-gym-v2.png / bela-gym-v2.png). No longer an assumption.
    id: "mano",
    photo: "/trainers/mano-crossed-card-v1.png",
    name: { ka: "მანო ქუთათელაძე", en: "Mano Kutateladze" },
    role: { ka: "სერტიფიცირებული პერსონალური მწვრთნელი", en: "Certified personal trainer" },
    cardRole: { ka: "პერსონალური მწვრთნელი", en: "Personal trainer" },
    specialty: { ka: "ტანვარჯიში · პირადი ვარჯიში", en: "Gymnastics · Personal training" },
    stats: [
      { v: "GEO", k: { ka: "მრავალგზის ჩემპიონი", en: "multiple champion" } },
      { v: "1:1", k: { ka: "პირადი ვარჯიში", en: "personal training" } },
    ],
    short: {
      ka: "ყოფილი ტანმოვარჯიშე და საქართველოს მრავალგზის ჩემპიონი, რომელიც მრავალწლიან გამოცდილებას შენს მიზნებზე მორგებულ ვარჯიშად აქცევს.",
      en: "A former gymnast and multiple Georgian champion who turns years of sporting experience into training built around your goals.",
    },
    bio: [
      {
        ka: "მე ვარ მანო ქუთათელაძე, ყოფილი ტანმოვარჯიშე და საქართველოს მრავალგზის ჩემპიონი. მრავალწლიანი სპორტული გამოცდილებისა და გავლილი კურსების საფუძველზე ჩემს ცოდნასა და გამოცდილებას ვიყენებ იმისთვის, რომ თითოეულ ადამიანს დავეხმარო საკუთარი მიზნების მიღწევაში.",
        en: "I am Mano Kutateladze, a former gymnast and multiple Georgian champion. Drawing on many years of sporting experience and professional courses, I use my knowledge to help each person reach their own goals.",
      },
      {
        ka: "ჩემი მიზანია, დავეხმარო ადამიანებს არა მხოლოდ სასურველი ფიზიკური ფორმის მიღწევაში, არამედ ისეთი ცხოვრების წესის ჩამოყალიბებაში, რომელიც ჯანმრთელობას, თავდაჯერებულობასა და მუდმივ პროგრესს მოგიტანთ. შედეგი არ არის შემთხვევითობა — ის სწორად დაგეგმილი შრომის შედეგია. ამიტომ, თუ მზად ხარ შეცვალო საკუთარი თავი, ერთად აუცილებლად მივაღწევთ მიზანს.",
        en: "My goal is to help people not only achieve the physical shape they want, but build a way of life that brings health, confidence, and continued progress. Results are not an accident — they come from well-planned work. If you are ready to change, together we will reach the goal.",
      },
    ],
  },
  {
    id: "guga",
    photo: "/trainers/guga.jpg",
    name: { ka: "გუგა აფხაძე", en: "Guga Apkhadze" },
    role: { ka: "სერტიფიცირებული პერსონალური მწვრთნელი", en: "Certified personal trainer" },
    cardRole: { ka: "პერსონალური მწვრთნელი", en: "Personal trainer" },
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
    id: "bela",
    photo: "/trainers/bela.jpg",
    name: { ka: "ბელა სალუქვაძე", en: "Bela Salukvadze" },
    role: { ka: "სერტიფიცირებული პერსონალური მწვრთნელი", en: "Certified personal trainer" },
    cardRole: { ka: "პერსონალური მწვრთნელი", en: "Personal trainer" },
    specialty: { ka: "ჯგუფური ვარჯიშების მწვრთნელი · კარდიო კიკბოქსი · აერობიკა", en: "Group class trainer · Cardio kickboxing · Aerobics" },
    stats: [
      { v: "3", k: { ka: "ვარჯიში", en: "classes" } },
      { v: "6", k: { ka: "ჯგუფი / კვირა", en: "groups / week" } },
    ],
    short: {
      ka: "უძღვება კარდიო კიკბოქსს, აერობიკასა და კალი-ლიბიდო ფლოუს.",
      en: "Leads our cardio kickboxing, aerobics and Kali-Libido Flow classes.",
    },
  },
  {
    id: "natia",
    photo: "/trainers/natia-gym-v2.png",
    name: { ka: "ნათია ბუთიაშვილი", en: "Natia Butiashvili" },
    role: { ka: "სერტიფიცირებული პერსონალური მწვრთნელი", en: "Certified personal trainer" },
    cardRole: { ka: "პერსონალური მწვრთნელი", en: "Personal trainer" },
    specialty: { ka: "ფიტნესის პერსონალური ტრენერი", en: "Fitness personal trainer" },
    stats: [
      { v: "3", k: { ka: "წელი", en: "years" } },
      { v: "MATA", k: { ka: "აკადემია", en: "Academy" } },
    ],
    short: {
      ka: "MATA Academy-ის პერსონალური ტრენერი. სამი წლის გამოცდილება, ინდივიდუალურ მიდგომასა და უსაფრთხო, სწორ ტექნიკაზე აგებული ვარჯიში.",
      en: "MATA Academy personal trainer. Three years of experience, with training built on an individual approach and safe, correct technique.",
    },
    bio: [
      {
        ka: "უკვე 3 წელია, რაც ფიტნესი ჩემი ცხოვრების განუყოფელი ნაწილია და ამ დროის განმავლობაში ჩემი მთავარი მიზანი ადამიანებისთვის ჯანსაღი ცხოვრების წესის, სწორი ვარჯიშისა და საკუთარი შესაძლებლობების უკეთ გაცნობის ხელშეწყობაა. პროფესიული ცოდნის კიდევ უფრო გასაღრმავებლად გავიარე MATA Academy-ის პერსონალური ტრენერის კურსი, რომელმაც მომცა შესაძლებლობა, გამეღრმავებინა ცოდნა ვარჯიშის სწორად დაგეგმვის, მოძრაობის ტექნიკის, დატვირთვის სწორად შერჩევისა და ინდივიდუალური მიდგომის მიმართულებით.",
        en: "Fitness has been an inseparable part of my life for three years now, and throughout that time my main goal has been to help people build a healthy way of life, train correctly, and get to know their own abilities better. To deepen my professional knowledge further, I completed the personal trainer course at MATA Academy, which let me expand what I know about planning training correctly, movement technique, choosing the right load, and an individual approach.",
      },
      {
        ka: "ჩემთვის თითოეული ადამიანი განსხვავებულია — შესაბამისად, ვარჯიშის პროგრამაც უნდა იყოს მორგებული მის მიზნებზე, შესაძლებლობებსა და ცხოვრების სტილზე. ჩემი მუშაობის მთავარი პრინციპებია ინდივიდუალური მიდგომა, სწორი ტექნიკა, თანმიმდევრულობა და უსაფრთხო ვარჯიში. 3-წლიანი პრაქტიკული გამოცდილებისა და MATA Academy-ში მიღებული პროფესიული ცოდნის გაერთიანებით, ვცდილობ თითოეულ ადამიანს დავეხმარო არა მხოლოდ სასურველი შედეგის მიღწევაში, არამედ ისეთი ჩვევების ჩამოყალიბებაში, რომლებიც გრძელვადიანად გახდება მისი ცხოვრების ნაწილი.",
        en: "For me, every person is different — so the training programme has to be fitted to their goals, abilities and lifestyle. The main principles of my work are an individual approach, correct technique, consistency and safe training. By combining three years of hands-on experience with the professional knowledge I gained at MATA Academy, I try to help each person not only reach the result they want, but form habits that become a lasting part of their life.",
      },
    ],
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
    { ka: "შექმნილია წყალტუბოსთვის", en: "Built for Tskaltubo" },
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
      price: 15,
      unit: { ka: "₾ / დღე", en: "GEL / day" },
      blurb: {
        ka: "მხოლოდ გამოივლი? აიღე ერთდღიანი და ისარგებლე სრული დარბაზით.",
        en: "Just visiting? Grab a single-day pass and use the full floor.",
      },
      features: [
        { ka: "სრული დარბაზი", en: "Full floor access" },
        { ka: "საშხაპე და საკეტი", en: "Locker & showers" },
      ],
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
    },
  ] satisfies Plan[],
  also: [
    { label: { ka: "1 კვირა", en: "1 week" }, price: 50 },
    { label: { ka: "2 კვირა", en: "2 weeks" }, price: 80 },
    { label: { ka: "3 თვე", en: "3 months" }, price: 300 },
    { label: { ka: "6 თვე", en: "6 months" }, price: 550 },
    { label: { ka: "თვეში 12 ვიზიტი", en: "12 visits / mo" }, price: 100 },
    { label: { ka: "სტუდენტი / სკოლის მოსწავლე", en: "Student / school pupil" }, price: 100 },
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
    ka: "ბარათი 10 ₾ · სამაჯური 20 ₾ (ერთჯერადი)",
    en: "Access card 10 ₾ · Wristband 20 ₾ (one-time)",
  },
};

/* --------------------------------------------------------- 09 contact */

export const contact = {
  title: { ka: "შემოგვიარე წყალტუბოში", en: "Come say hi in Tskaltubo" },
  cta: { ka: "დარეკე და დაჯავშნე", en: "Call and book" },
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
