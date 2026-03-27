import { 
  Users, 
  Megaphone, 
  Target, 
  Briefcase, 
  FileText, 
  HeartHandshake,
  Heart,
  BookOpen,
  Scale,
  Globe, 
  Sun,
  Zap,
  Leaf,
  GraduationCap,
  Lightbulb,
  Building2,
  Eye,
  Calendar,
  TrendingUp,
  Shield,
  AlertCircle,
  MessageSquare,
  Video,
  MapPin,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Department, Opportunity, Project, SDG, TeamMember, FocusArea, DocumentItem, PartnerGroup } from './types';

// Helper function to format image paths.
const p = (fileName: string) => {
  if (fileName.startsWith('http')) return fileName;
  return `/LOGO%20PAR/${encodeURIComponent(fileName)}`;
};

const placeholder = (text: string) => `https://placehold.co/400x200/ffffff/031B47?text=${encodeURIComponent(text)}`;

export const NAV_LINKS_UK = [
  { name: 'Про нас', path: '/about' },
  { name: 'Команда', path: '/team' },
  { name: 'Проєкти', path: '/projects' },
  { name: 'Можливості', path: '/opportunities' },
  { name: 'Документи', path: '/documents' },
];

export const NAV_LINKS_EN = [
  { name: 'About', path: '/about' },
  { name: 'Team', path: '/team' },
  { name: 'Projects', path: '/projects' },
  { name: 'Opportunities', path: '/opportunities' },
  { name: 'Documents', path: '/documents' },
];

export const NAV_LINKS = NAV_LINKS_UK;

// --- PRINCIPLES OF ACTIVITY ---
export const PRINCIPLES_UK = [
  {
    id: 'participation',
    title: 'Участь',
    description: 'Визнаємо право кожної молодої особи на участь в ухваленні рішень міста.',
    theses: [
      'Залучення до реалізації власних планів та ініціатив громади.',
      'Розвиток компетентностей та двосторонній обмін досвідом.',
      'Участь активістів у плануванні та житті КММР.'
    ],
    icon: Users,
    color: 'bg-kmmr-blue dark:bg-blue-400'
  },
  {
    id: 'cooperation',
    title: 'Співпраця',
    description: 'Забезпечуємо взаємодію та співпрацю між різними групами для досягнення спільних цілей.',
    theses: [
      'Об\'єднання зусиль для реалізації спільних проєктів.',
      'Партнерство з усіма ОГС та молодіжними ініціативами.',
      'Постійний діалог як основа розвитку молодіжного руху.'
    ],
    icon: HeartHandshake,
    color: 'bg-kmmr-pink'
  },
  {
    id: 'openness',
    title: 'Відкритість',
    description: 'Сприяємо залученню громадськості до діалогу та прозорості ухвалення рішень.',
    theses: [
      'Зрозумілість процесів та вільний доступ до результатів роботи.',
      'Публічне обговорення, реакція на критику та відповідальність.',
      'Побудова довіри всередині інституції та з громадськістю.'
    ],
    icon: Eye,
    color: 'bg-kmmr-green'
  },
  {
    id: 'development',
    title: 'Розвиток',
    description: 'Впливаємо на ухвалення рішень владою та впроваджуємо інновації.',
    theses: [
      'Формування нових стандартів міської молодіжної політики.',
      'Впровадження інновацій та підтримка молодіжних ініціатив.',
      'Постійне вдосконалення професійних навичок команди.'
    ],
    icon: TrendingUp,
    color: 'bg-kmmr-orange'
  },
  {
    id: 'diversity',
    title: 'Різноманітність',
    description: 'Враховуємо інтереси молодих людей різних соціальних груп.',
    theses: [
      'Підтримка потреб молоді незалежно від соціального статусу.',
      'Сприяння інклюзивності у молодіжному середовищі.',
      'Спільна робота задля захисту прав та інтересів молоді.'
    ],
    icon: Globe,
    color: 'bg-indigo-500'
  }
];

export const PRINCIPLES_EN = [
  {
    id: 'participation',
    title: 'Participation',
    description: 'We recognize the right of every young person to participate in the city\'s decision-making.',
    theses: [
      'Involvement in the implementation of personal plans and community initiatives.',
      'Development of competencies and bilateral exchange of experience.',
      'Participation of activists in the planning and life of KCYC.'
    ],
    icon: Users,
    color: 'bg-kmmr-blue dark:bg-blue-400'
  },
  {
    id: 'cooperation',
    title: 'Cooperation',
    description: 'We ensure interaction and cooperation between different groups to achieve common goals.',
    theses: [
      'Joining forces for the implementation of joint projects.',
      'Partnership with all CSOs and youth initiatives.',
      'Constant dialogue as the basis for the development of the youth movement.'
    ],
    icon: HeartHandshake,
    color: 'bg-kmmr-pink'
  },
  {
    id: 'openness',
    title: 'Openness',
    description: 'We promote public engagement in dialogue and transparency in decision-making.',
    theses: [
      'Clarity of processes and free access to work results.',
      'Public discussion, reaction to criticism, and accountability.',
      'Building trust within the institution and with the public.'
    ],
    icon: Eye,
    color: 'bg-kmmr-green'
  },
  {
    id: 'development',
    title: 'Development',
    description: 'We influence government decisions and implement innovations.',
    theses: [
      'Shaping new standards for city youth policy.',
      'Implementation of innovations and support for youth initiatives.',
      'Constant improvement of the team\'s professional skills.'
    ],
    icon: TrendingUp,
    color: 'bg-kmmr-orange'
  },
  {
    id: 'diversity',
    title: 'Diversity',
    description: 'We consider the interests of young people from different social groups.',
    theses: [
      'Supporting youth needs regardless of social status.',
      'Promoting inclusivity in the youth environment.',
      'Working together to protect the rights and interests of youth.'
    ],
    icon: Globe,
    color: 'bg-indigo-500'
  }
];


// --- DOCUMENTS ---
export const DOCUMENTS_LIST_UK: DocumentItem[] = [
  { id: 'statute', title: 'Статут Організації', type: 'PDF', date: '12.01.2024', size: '2.4 MB', link: '#' },
  { id: 'report-2023', title: 'Річний звіт за 2023 рік', type: 'PDF', date: '15.02.2024', size: '5.1 MB', link: '#' },
  { id: 'strategy', title: 'Стратегія розвитку 2024-2026', type: 'PDF', date: '01.03.2024', size: '1.8 MB', link: '#' },
  { id: 'membership', title: 'Положення про членство', type: 'DOCX', date: '10.01.2024', size: '0.5 MB', link: '#' }
];

export const DOCUMENTS_LIST_EN: DocumentItem[] = [
  { id: 'statute', title: 'Organization Statute', type: 'PDF', date: '12.01.2024', size: '2.4 MB', link: '#' },
  { id: 'report-2023', title: 'Annual Report 2023', type: 'PDF', date: '15.02.2024', size: '5.1 MB', link: '#' },
  { id: 'strategy', title: 'Development Strategy 2024-2026', type: 'PDF', date: '01.03.2024', size: '1.8 MB', link: '#' },
  { id: 'membership', title: 'Membership Regulation', type: 'DOCX', date: '10.01.2024', size: '0.5 MB', link: '#' }
];

export const DOCUMENTS_LIST = DOCUMENTS_LIST_UK;

// --- SDGs (Universal) ---
export const SDGS_UK: SDG[] = [
  { id: 1, title: 'Подолання бідності', icon: HeartHandshake, color: '#E5243B' },
  { id: 3, title: 'Міцне здоров\'я', icon: Heart, color: '#4C9F38' },
  { id: 4, title: 'Якісна освіта', icon: BookOpen, color: '#C5192D' },
  { id: 5, title: 'Гендерна рівність', icon: Scale, color: '#FF3A21' }, 
  { id: 8, title: 'Гідна праця', icon: Briefcase, color: '#A21942' },
  { id: 10, title: 'Скорочення нерівності', icon: Target, color: '#DD1367' },
  { id: 13, title: 'Боротьба зі зміною клімату', icon: Globe, color: '#3F7E44' },
  { id: 16, title: 'Мир та справедливість', icon: Leaf, color: '#00689D' },
];

export const SDGS_EN: SDG[] = [
  { id: 1, title: 'No Poverty', icon: HeartHandshake, color: '#E5243B' },
  { id: 3, title: 'Good Health', icon: Heart, color: '#4C9F38' },
  { id: 4, title: 'Quality Education', icon: BookOpen, color: '#C5192D' },
  { id: 5, title: 'Gender Equality', icon: Scale, color: '#FF3A21' }, 
  { id: 8, title: 'Decent Work', icon: Briefcase, color: '#A21942' },
  { id: 10, title: 'Reduced Inequalities', icon: Target, color: '#DD1367' },
  { id: 13, title: 'Climate Action', icon: Globe, color: '#3F7E44' },
  { id: 16, title: 'Peace & Justice', icon: Leaf, color: '#00689D' },
];

export const SDGS = SDGS_UK;

// --- CAPACITY ---
export interface CapacityItem {
  title: string;
  description: string;
  icon: any;
  color: string;
  cta: string;
}

export const CAPACITY_UK: CapacityItem[] = [
  {
    title: 'Відкрита комунікація',
    description: 'Ми маємо соціальні мережі: Instagram, Facebook, LinkedIn, YouTube; Telegram-канал; цільову розсилку SendPulse. Відвідуваність заходів — від 30 осіб. Наш рекорд у Києві — 105 осіб на одному заході.',
    icon: MessageSquare,
    color: '#8BC442',
    cta: 'Наші соцмережі'
  },
  {
    title: 'База практики',
    description: 'Ми маємо можливість залучати інтернів з різних університетів та різних спеціальностей. Все залежить від потреб університету або наших. З 2021 року у нас було 70 інтернів за спеціальностями: журналістика, PR та маркетинг.',
    icon: GraduationCap,
    color: '#031B47',
    cta: 'Стати інтерном'
  },
  {
    title: 'Зв’язки з громадськістю',
    description: 'Ми маємо доступ до медіаканалів. Комунікуємо із зірками, акторами та відомими особистостями українського суспільства. Маємо налагоджену комунікацію з різними вечірками та рейвами Києва.',
    icon: Megaphone,
    color: '#D7269B',
    cta: 'Співпраця'
  },
  {
    title: 'Матеріально-технічне забезпечення',
    description: 'Ми маємо: канцелярію, стабілізатор для відеозйомки, петличні мікрофони, штатив для камери, софтбокси. Ми можемо домовлятися та використовувати майно наших організацій-членів, так само як вони використовують наше.',
    icon: Video,
    color: '#FA8700',
    cta: 'Запит на ресурси'
  },
  {
    title: 'Експертна спільнота',
    description: 'Представництва міжнародних рухів є частиною нашої спільноти. Серед вітчизняного ринку організацій ми маємо найстарішу НУО в країні — Українську Раду Миру, діяльність якої была відновлена головою нашої НУО.',
    icon: ShieldCheck,
    color: '#3F1B65',
    cta: 'Долучитися'
  },
  {
    title: 'Простір',
    description: 'Ми маємо місце для проведення заходів, робочих зустрічей наших та наших організацій-членів, для постійної роботи у формі окремої кімнати або простору загалом, ми можемо бронювати простір, якщо він вільний. Це коворкінг iHUB.',
    icon: Building,
    color: '#6D351A',
    cta: 'Забронювати'
  }
];

export const CAPACITY_EN: CapacityItem[] = [
  {
    title: 'Open communication',
    description: 'We have social media: Instagram, Facebook, LinkedIn, YouTube; Telegram channel; SendPulse targeted mailing list. Attendance at events is from 30 people. Our record in Kyiv is 105 people at one event.',
    icon: MessageSquare,
    color: '#8BC442',
    cta: 'Our social media'
  },
  {
    title: 'Practice base',
    description: 'We are able to engage interns from different universities and different specialties. It all depends on the needs of the university or ours. Since 2021, we have had 70 interns with a degree in journalism, PR, and marketing.',
    icon: GraduationCap,
    color: '#031B47',
    cta: 'Become an intern'
  },
  {
    title: 'Public relations',
    description: 'We have access to media channels. We communicate with stars, actors and famous personalities of Ukrainian society. We are in good communication with various parties and raves in Kyiv.',
    icon: Megaphone,
    color: '#D7269B',
    cta: 'Collaboration'
  },
  {
    title: 'Material and technical support',
    description: 'We have: stationery, a stabiliser for video filming, microphone loops, a camera tripod, light boxes. We can negotiate and use the property of our member organisations as they use ours.',
    icon: Video,
    color: '#FA8700',
    cta: 'Resource request'
  },
  {
    title: 'Expert community',
    description: 'Representations of international movements are part of our community. Among the domestic market of organisations, we have the oldest NGO in the country, the Ukrainian Peace Council, whose activities were resumed by the head of our NGO.',
    icon: ShieldCheck,
    color: '#3F1B65',
    cta: 'Join us'
  },
  {
    title: 'Space',
    description: 'We have a place for events, working meetings of our and our member organisations, for permanent work in the form of a separate room or space in general, we can book space if it is free. This is the iHUB coworking space.',
    icon: Building,
    color: '#6D351A',
    cta: 'Book space'
  }
];

// --- DEPARTMENTS ---
export const DEPARTMENTS_UK: Department[] = [
  { id: 'smm', name: 'SMM команда', description: 'Голос організації в цифровому просторі. Ми створюємо контент, що надихає.', icon: Megaphone, color: 'bg-kmmr-orange' },
  { id: 'projects', name: 'Проєктна команда', description: 'Архітектори змін. Ми перетворюємо ідеї на реальні заходи та ініціативи.', icon: Target, color: 'bg-kmmr-green' },
  { id: 'pr', name: 'Піар відділ', description: 'Будуємо мости комунікації. Зовнішній та внутрішній бренд організації.', icon: Users, color: 'bg-kmmr-pink' },
  { id: 'fundraising', name: 'Фандрайзингова команда', description: 'Паливо для наших ідей. Пошук ресурсів та партнерів.', icon: Briefcase, color: 'bg-kmmr-brown' },
  { id: 'secretariat', name: 'Секретаріат', description: 'Серце структури. Документообіг та організаційна підтримка.', icon: FileText, color: 'bg-kmmr-blue dark:bg-blue-400' }
];

export const DEPARTMENTS_EN: Department[] = [
  { id: 'smm', name: 'SMM Team', description: 'The voice of the organization in the digital space. We create inspiring content.', icon: Megaphone, color: 'bg-kmmr-orange' },
  { id: 'projects', name: 'Project Team', description: 'Architects of change. We turn ideas into real events and initiatives.', icon: Target, color: 'bg-kmmr-green' },
  { id: 'pr', name: 'PR Department', description: 'Building communication bridges. External and internal brand of the organization.', icon: Users, color: 'bg-kmmr-pink' },
  { id: 'fundraising', name: 'Fundraising Team', description: 'Fuel for our ideas. Searching for resources and partners.', icon: Briefcase, color: 'bg-kmmr-brown' },
  { id: 'secretariat', name: 'Secretariat', description: 'The heart of the structure. Document flow and organizational support.', icon: FileText, color: 'bg-kmmr-blue dark:bg-blue-400' }
];

export const DEPARTMENTS = DEPARTMENTS_UK;

// --- PARTNERS ---
export const PARTNER_GROUPS_UK: PartnerGroup[] = [
  {
    id: 'partners',
    title: 'Партнери',
    description: 'Інституції та компанії, з якими ми реалізуємо спільні проєкти.',
    icon: HeartHandshake,
    color: 'bg-kmmr-blue dark:bg-blue-400',
    items: [
      { name: 'Будинок Кіно', image: placeholder('Будинок Кіно') },
      { name: 'Департамент Молоді та Спорту', image: placeholder('Департамент МС') },
      { name: 'В КПДЮ', image: placeholder('КПДЮ') },
      { name: 'Німецький Дім-Київ', image: placeholder('Німецький Дім') },
      { name: 'Averina', image: placeholder('Averina') },
      { name: 'Aware zone', image: placeholder('Aware zone') },
      { name: 'EPA', image: placeholder('EPA') },
      { name: 'IHUB', image: placeholder('IHUB') },
      { name: 'Kyiv Campus', image: placeholder('Kyiv Campus') },
      { name: 'Your communication', image: placeholder('Your communication') },
      { name: 'Київський молодіжний центр', image: placeholder('КМЦ') }
    ].map(item => ({ ...item, icon: Briefcase }))
  },
  {
    id: 'organizations',
    title: 'Організації',
    description: 'Громадські організації, що входять до складу або співпрацюють з нами.',
    icon: Building2,
    color: 'bg-kmmr-green',
    items: [
      { name: 'Взаємодія молоді', image: placeholder('Взаємодія') },
      { name: 'CIM', image: placeholder('CIM') },
      { name: 'Відрада', image: placeholder('Відрада') },
      { name: 'Дакус', image: placeholder('Дакус') },
      { name: 'Німецький молодіжний клуб', image: placeholder('НМК') },
      { name: 'Ранганатха', image: placeholder('Ранганатха') },
      { name: 'Скаути України', image: placeholder('Скаути') },
      { name: 'Український Альянс', image: placeholder('Укр Альянс') },
      { name: 'Центр соціальних транформацій', image: placeholder('ЦСТ') },
      { name: 'Aiesec', image: placeholder('Aiesec') },
      { name: 'Erasmus Students Network', image: placeholder('ESN') },
      { name: 'Key Generation', image: placeholder('Key Gen') },
      { name: "Let's do it", image: placeholder("Let's do it") },
      { name: 'Qhub', image: placeholder('Qhub') },
      { name: 'Thesmos Ares', image: placeholder('Thesmos Ares') },
    ].map(item => ({ ...item, icon: Users }))
  },
  {
    id: 'observers',
    title: 'Спостерігачі',
    description: 'Організації, що мають статус спостерігачів при КММР.',
    icon: Eye,
    color: 'bg-kmmr-pink',
    items: [
      { name: 'КМРС', image: placeholder('КМРС') },
      { name: 'СПУ', image: placeholder('СПУ') },
    ].map(item => ({ ...item, icon: Eye }))
  }
];

export const PARTNER_GROUPS_EN: PartnerGroup[] = [
  {
    id: 'partners',
    title: 'Partners',
    description: 'Institutions and companies with whom we implement joint projects.',
    icon: HeartHandshake,
    color: 'bg-kmmr-blue dark:bg-blue-400',
    items: PARTNER_GROUPS_UK[0].items
  },
  {
    id: 'organizations',
    title: 'Organizations',
    description: 'Public organizations that are part of or cooperate with us.',
    icon: Building2,
    color: 'bg-kmmr-green',
    items: PARTNER_GROUPS_UK[1].items
  },
  {
    id: 'observers',
    title: 'Observers',
    description: 'Organizations holding observer status at KCYC.',
    icon: Eye,
    color: 'bg-kmmr-pink',
    items: PARTNER_GROUPS_UK[2].items
  }
];

export const PARTNER_GROUPS = PARTNER_GROUPS_UK;

// --- TEAM ---
export const TEAM_MEMBERS_UK: TeamMember[] = [
  {
    id: '1',
    name: 'Владислав Олексієнко',
    role: 'Президент організації',
    department: 'secretariat',
    email: 'vladyslav@kmmr.org',
    bio: 'Співзасновник, Лідер, Натхненник.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    details: ['20 років, народився в м. Києві', 'Здобуває освіту в ННІ права КНУ ім. Т. Шевченка', 'Понад 2 роки займається громадською активністю', 'Керує стратегічним розвитком КММР']
  },
  {
    id: '2',
    name: 'Анна Коваль',
    role: 'Голова SMM відділу',
    department: 'smm',
    bio: 'Креатив та комунікація.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    details: ['Досвід у SMM 3 роки', 'Студентка Могилянки', 'Відповідає за візуальний стиль та tone of voice']
  },
  {
    id: '3',
    name: 'Дмитро Соловей',
    role: 'Голова проєктного відділу',
    department: 'projects',
    bio: 'Менеджмент та реалізація.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    details: ['Організував більше 20 заходів', 'Спеціаліст з грантового менеджменту', 'Координує роботу проєктних менеджерів']
  },
  {
    id: '4',
    name: 'Марія Іваненко',
    role: 'Головний фандрайзер',
    department: 'fundraising',
    bio: 'Ресурси для змін.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    details: ['Залучила фінансування на 5 великих проєктів', 'Має широку мережу контактів з бізнесом', 'Проводить тренінги з фандрайзингу']
  },
  {
    id: '5',
    name: 'Олег Петренко',
    role: 'PR менеджер',
    department: 'pr',
    bio: 'Зв\'язки з громадськістю.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    details: ['Відповідає за зв\'язки зі ЗМІ', 'Організовує прес-конференції', 'Веде комунікацію з партнерами']
  }
];

export const TEAM_MEMBERS_EN: TeamMember[] = [
  {
    id: '1',
    name: 'Vladyslav Oleksiienko',
    role: 'President',
    department: 'secretariat',
    email: 'vladyslav@kmmr.org',
    bio: 'Co-founder, Leader, Inspirer.',
    image: TEAM_MEMBERS_UK[0].image,
    details: ['20 years old, born in Kyiv', 'Studying at Taras Shevchenko National University of Kyiv', 'Over 2 years of civic activity', 'Manages strategic development of KCYC']
  },
  {
    id: '2',
    name: 'Anna Koval',
    role: 'Head of SMM',
    department: 'smm',
    bio: 'Creativity and communication.',
    image: TEAM_MEMBERS_UK[1].image,
    details: ['3 years of experience in SMM', 'Student at Kyiv-Mohyla Academy', 'Responsible for visual style and tone of voice']
  },
  {
    id: '3',
    name: 'Dmytro Solovey',
    role: 'Head of Project Dept',
    department: 'projects',
    bio: 'Management and implementation.',
    image: TEAM_MEMBERS_UK[2].image,
    details: ['Organized over 20 events', 'Grant management specialist', 'Coordinates project managers']
  },
  {
    id: '4',
    name: 'Maria Ivanenko',
    role: 'Chief Fundraiser',
    department: 'fundraising',
    bio: 'Resources for change.',
    image: TEAM_MEMBERS_UK[3].image,
    details: ['Raised funds for 5 major projects', 'Extensive business network', 'Conducts fundraising training']
  },
  {
    id: '5',
    name: 'Oleg Petrenko',
    role: 'PR Manager',
    department: 'pr',
    bio: 'Public Relations.',
    image: TEAM_MEMBERS_UK[4].image,
    details: ['Responsible for media relations', 'Organizes press conferences', 'Manages partner communication']
  }
];

export const TEAM_MEMBERS = TEAM_MEMBERS_UK;

// --- PROJECTS ---
export const PROJECTS_UK: Project[] = [
  {
    id: 'money-week',
    title: 'Money Week Forum 2.0',
    description: `Money Week Forum 2.0: Розкрий свій фінансовий потенціал! 🌍 Форум проводиться в рамках Global Money Week – міжнародної ініціативи, яка об’єднує молодь у 100+ країнах світу для підвищення фінансової грамотності.

Це унікальна можливість зануритися у світ фінансів, підприємництва та кар’єрного зростання. Два дні інтенсиву, які можуть змінити твоє життя!

📌 Що на тебе чекає?
▫️ Інсайти від топових підприємців(-иць), інвесторів(-ок) та бізнес-лідерів(-ок);
▫️ Воркшопи, де ти отримаєш практичні знання та навички зі створення власної справи;
▫️ Знайомства з представниками та представницями провідних українських компаній та стартапів;
▫️ Продуктивний нетворкінг з однодумцями та майбутніми партнерами та партнерками.

🔥Чому варто тут бути?
Хочеш навчитись керувати грошима, побудувати кар’єру чи створити власний бізнес? Money Week 2.0 — це шанс отримати реальні знання, знайомства та можливості, які допоможуть тобі досягти фінансової свободи. Тут ти знайдеш відповіді на питання, які хвилюють усіх, хто прагне успіху. Це твій перший крок до змін!

👥 Кому буде корисно?
Майбутнім підприємцям і підприємицям, які хочуть стартувати власний бізнес.
Молодим фахівцям, які прагнуть швидкого кар’єрного росту.
Всім, хто хоче навчитися ефективно керувати фінансами.

🏆 Що ти отримаєш?
▫️ Чітке розуміння старту власної справи або кар’єрного прориву;
▫️ Реальні кейси та стратегії успіху від підприємців(-иць) та бізнес-лідерів(-ок);
▫️ Нові знайомства та можливості для співпраці з найкращими компаніями;
▫️ Драйвову атмосферу та натхнення діяти вже зараз!

📅 Дата: 29-30 березня 📍
Місце проведення буде вказано при підтвердженні реєстрації.
Участь: безоплатна, за попередньої реєстрації.
📢Кількість місць обмежена, учасникам(-цям) надійдуть відповідні листи.

🚀 Готовий(-а) змінити своє фінансове майбутнє?
Реєструйся в шапці профілю зараз та стань частиною нового покоління підприємців!

👉 Слідкуй за оновленнями та деталями заходу на наших офіційних сторінках!`,
    date: 'Травень 2024',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    instagramLink: 'https://www.instagram.com/p/DHGqANQI4Pq/'
  },
  {
    id: 'kyiv-urban-hack-2026',
    title: 'Kyiv Urban Hackathon 2026',
    description: 'Творимо місто майбутнього разом! 48-годинний марафон, де команди розробників, дизайнерів та урбаністів працюватимуть над вирішенням актуальних інфраструктурних проблем Києва. Ментори з Міської Ради та провідних IT-компаній, пітчинг ідей перед інвесторами та можливість отримати фінансування на реалізацію прототипу.',
    date: '12-14 Лютого 2026',
    deadline: '2026-02-12',
    image: 'https://images.unsplash.com/photo-1504384308090-c54be3855833?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    instagramLink: 'https://www.instagram.com'
  },
  {
    id: 'ngo-office',
    title: 'Офіс НУО: Кадри',
    description: 'Інтенсивна програма підготовки кваліфікованих кадрів для громадського сектору. Навчання проєктному менеджменту, комунікаціям та лідерству.',
    date: 'Квітень 2024',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    instagramLink: 'https://www.instagram.com/p/DJCOwF8IYwX/'
  },
  {
    id: 'youth-dialogue',
    title: 'Молодіжний Діалог',
    description: 'Серія зустрічей молоді з представниками місцевої влади для обговорення актуальних проблем міста.',
    date: 'Постійно діючий',
    image: 'https://images.unsplash.com/photo-1577962917302-cd874c4e3169?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    instagramLink: 'https://www.instagram.com'
  }
];

export const PROJECTS_EN: Project[] = [
  {
    id: 'money-week',
    title: 'Money Week Forum 2.0',
    description: 'Large-scale financial literacy forum for youth. Lectures from leading experts, workshops, and networking.',
    date: 'May 2024',
    image: PROJECTS_UK[0].image,
    instagramLink: PROJECTS_UK[0].instagramLink
  },
  {
    id: 'kyiv-urban-hack-2026',
    title: 'Kyiv Urban Hackathon 2026',
    description: 'Creating the city of the future together! A 48-hour marathon where teams of developers, designers, and urbanists will work on solving current infrastructure problems in Kyiv. Mentors from the City Council and leading IT companies, idea pitching to investors and the opportunity to receive funding for prototype implementation.',
    date: 'February 12-14, 2026',
    deadline: '2026-02-12',
    image: PROJECTS_UK[1].image,
    instagramLink: PROJECTS_UK[1].instagramLink
  },
  {
    id: 'ngo-office',
    title: 'NGO Office: Personnel',
    description: 'Intensive training program for qualified personnel for the public sector. Training in project management, communications, and leadership.',
    date: 'April 2024',
    image: PROJECTS_UK[2].image,
    instagramLink: PROJECTS_UK[2].instagramLink
  },
  {
    id: 'youth-dialogue',
    title: 'Youth Dialogue',
    description: 'Series of meetings between youth and local government representatives to discuss current city issues.',
    date: 'Ongoing',
    image: PROJECTS_UK[3].image,
    instagramLink: PROJECTS_UK[3].instagramLink
  }
];

export const PROJECTS = PROJECTS_UK;

// --- OPPORTUNITIES ---
export const OPPORTUNITIES_UK: Opportunity[] = [
  { id: 'vol-1', title: 'Набір до SMM команди', description: 'Шукаємо креативних копірайтерів та дизайнерів, готових розвивати соцмережі КММР.', deadline: '', link: '/contacts', type: 'Volunteering' },
  { id: 'event-1', title: 'Лекція: Лідерство в кризу', description: 'Відкрита лекція для всіх бажаючих. Спікери - топ-менеджери українських компаній.', deadline: '2026-01-25', link: '#', type: 'Event' },
  { id: 'edu-1', title: 'Школа Молодіжних Рад', description: 'Триденний інтенсив для представників молодіжних рад з усієї України.', deadline: '2026-03-15', link: '#', type: 'Education' }
];

export const OPPORTUNITIES_EN: Opportunity[] = [
  { id: 'vol-1', title: 'Call for SMM Team', description: 'We are looking for creative copywriters and designers ready to develop KCYC social networks.', deadline: '', link: '/contacts', type: 'Volunteering' },
  { id: 'event-1', title: 'Lecture: Leadership in Crisis', description: 'Open lecture for everyone. Speakers - top managers of Ukrainian companies.', deadline: '2026-01-25', link: '#', type: 'Event' },
  { id: 'edu-1', title: 'Youth Councils School', description: 'Three-day intensive for representatives of youth councils from all over Ukraine.', deadline: '2026-03-15', link: '#', type: 'Education' }
];

export const OPPORTUNITIES = OPPORTUNITIES_UK;

// --- TIMELINE DATA ---
export const TIMELINE_EVENTS_UK = [
  { year: '2017', icon: Calendar, color: 'text-kmmr-blue dark:text-blue-400', bg: 'bg-kmmr-blue dark:bg-blue-400', title: 'Заснування', desc: '13 травня 2017 року відбулися установчі збори та обрання першого Правління, що стало фактичним народженням КММР як інституції. У 2017–2019 роках формувалися внутрішні зв’язки.' },
  { year: '2019', icon: TrendingUp, color: 'text-kmmr-green', bg: 'bg-kmmr-green', title: 'Формування', desc: '20 серпня 2019 року відбулися позачергові Загальні збори. Це дало Раді новий імпульс розвитку, посилило довіру та професійність команди.' },
  { year: '2022', icon: Shield, color: 'text-kmmr-orange', bg: 'bg-kmmr-orange', title: 'Відновлення та самовдосконалення', desc: 'Повномасштабне вторгнення тимчасово «заморозило» діяльність, але з осені 2022 року Рада відновила активну роботу. Оновлено візуальну айдентику.' },
  { year: 'Сьогодні', icon: Briefcase, color: 'text-kmmr-pink', bg: 'bg-kmmr-pink', title: 'Можливості та результати', desc: 'Рада активно працює через соцмережі та офлайн-простори. Серед партнерів: департаменти КМДА, Київський молодіжний центр, НБУ, Deutsches Haus Kyiv та понад 20 інших.' },
  { year: 'Плани', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500', title: 'Виклики та Стратегія', desc: 'Ми працюємо над подоланням основних викликів. Стратегічні цілі: адвокація змін до законодавства, консолідація молоді Києва та залучення донорської підтримки.' },
];

export const TIMELINE_EVENTS_EN = [
  { year: '2017', icon: Calendar, color: 'text-kmmr-blue dark:text-blue-400', bg: 'bg-kmmr-blue dark:bg-blue-400', title: 'Foundation', desc: 'On May 13, 2017, the constituent assembly and election of the first Board took place, marking the birth of KCYC. In 2017–2019, internal connections were formed.' },
  { year: '2019', icon: TrendingUp, color: 'text-kmmr-green', bg: 'bg-kmmr-green', title: 'Formation', desc: 'On August 20, 2019, an extraordinary General Assembly took place. This gave the Council a new impulse for development and strengthened trust.' },
  { year: '2022', icon: Shield, color: 'text-kmmr-orange', bg: 'bg-kmmr-orange', title: 'Recovery and Self-Improvement', desc: 'The full-scale invasion temporarily paused activities, but since autumn 2022, the Council resumed active work. Visual identity was updated.' },
  { year: 'Today', icon: Briefcase, color: 'text-kmmr-pink', bg: 'bg-kmmr-pink', title: 'Opportunities and Results', desc: 'The Council works actively through social networks and offline spaces. Partners include: KSCA departments, Kyiv Youth Center, NBU, Deutsches Haus Kyiv.' },
  { year: 'Plans', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500', title: 'Challenges and Strategy', desc: 'We are working to overcome major challenges. Strategic goals: advocacy for legislative changes and attracting donor support.' },
];