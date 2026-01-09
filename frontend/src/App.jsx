import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Book, Landmark, Crown, Scroll, Menu, ChevronRight, 
  Home, User, Sword, Clock, ArrowRight, Brain, MapPin, X, Trophy, CheckCircle, 
  AlertCircle, Moon, Sun, Bookmark, Volume2, GitMerge, ArrowDown, 
  Lock, Plus, Trash2, Edit, LogOut, Save, GraduationCap, Building2, FileText, 
  Info, MinusCircle, PlusCircle, Image as ImageIcon, Printer, Mail, Phone, 
  Globe, Facebook, Twitter, Instagram, Share2, Type, Quote, 
  MessageSquare, Download, Upload, Wifi, WifiOff, Database, ServerCrash, Link as LinkIcon
} from 'lucide-react';

/**
 * ==========================================
 * CONFIGURATION & MOCK DATA
 * ==========================================
 */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${API_BASE}/api`; 
const LOGO_URL = "Logo.png"; // Placeholder Logo
const HERO_BG = "ranghar.jpg"; // Reliable Wikimedia Link

const CATEGORIES = [
  { id: 'all', label: 'ALL ARCHIVES', icon: Book, labelAs: "সকলো তথ্য", labelHi: "सभी अभिलेखागार" },
  { id: 'kings', label: 'SWARGADEOS', icon: Crown, labelAs: "স্বৰ্গদেউসকল", labelHi: "स्वर्गदेव (राजा)" },
  { id: 'wars', label: 'BATTLES', icon: Sword, labelAs: "যুদ্ধ আৰু সামৰিক", labelHi: "युद्ध और सैन्य" },
  { id: 'architecture', label: 'MONUMENTS', icon: Landmark, labelAs: "স্থাপত্য আৰু দুৰ্গ", labelHi: "वास्तुकला और किले" },
  { id: 'people', label: 'FIGURES', icon: User, labelAs: "প্ৰখ্যাত ব্যক্তি", labelHi: "प्रमुख व्यक्ति" },
  { id: 'culture', label: 'CULTURE', icon: Scroll, labelAs: "সংস্কৃতি আৰু পৰম্পৰা", labelHi: "संस्कृति और परंपरा" },
];

const QUIZ_QUESTIONS = [
  { id: 1, question: "Who was the founder of the Ahom Kingdom?", options: ["Rudra Singha", "Lachit Borphukan", "Chaolung Sukaphaa", "Pramatta Singha"], correct: 2 },
  { id: 2, question: "Which battle marked the decisive defeat of the Mughals by the Ahoms?", options: ["Battle of Plassey", "Battle of Saraighat", "Battle of Itakhuli", "Battle of Panipat"], correct: 1 },
  { id: 3, question: "What is the traditional Ahom burial mound called?", options: ["Stupa", "Maidam", "Gumbaz", "Samadhi"], correct: 1 },
  { id: 4, question: "Which Ahom king built the Rang Ghar?", options: ["Rudra Singha", "Shiva Singha", "Pramatta Singha", "Rajeswar Singha"], correct: 2 },
  { id: 5, question: "Where was the first capital of the Ahom Kingdom established?", options: ["Garhgaon", "Rangpur", "Jorhat", "Charaideo"], correct: 3 }
];

// Fallback content if database is empty or offline
const INITIAL_CMS = {
    about: {
        title: "About Project",
        text: "Sibsagar Digital is a comprehensive effort to digitize, preserve, and showcase the rich heritage of the Ahom Kingdom. Initiated by the Department of Computer Science at Sibsagar University, this project serves as a bridge between the glorious past of the 600-year Ahom rule and the digital future.\n\nOur mission is to create an accessible, educational, and immersive platform for students, researchers, and history enthusiasts worldwide. By archiving architectural marvels, military strategies, and cultural traditions, we aim to keep the legacy of the Swargadeos alive."
    },
    speech: {
        title: "Authority Speech",
        text: "\"The history of Sivasagar is not just the history of a district, but the soul of Assamese identity. This digital archive is a monumental step towards preserving our roots for generations to come.\"\n\n- Vice Chancellor, Sibsagar University"
    },
    district: {
        title: "Sivasagar District",
        text: "Sivasagar, formerly known as Rangpur, was the capital of the Ahom Kingdom from 1699 to 1788. The district derives its name from the Sivasagar Tank, commissioned by Queen Ambika in 1734.\n\nToday, it stands as a testament to the engineering prowess of the Ahoms, dotted with maidams (burial mounds), temples, and palaces that have survived centuries of weathering and earthquakes."
    }
};

const MOCK_ITEMS = [
  { 
    id: 1, 
    title: "Rang Ghar", 
    category: "architecture", 
    year: 1746, 
    summary: "The royal sports pavilion of the Ahom kings, often considered the oldest amphitheater in Asia.", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Rang_Ghar_Sibsagar.jpg/640px-Rang_Ghar_Sibsagar.jpg", 
    content: [
      { header: "Architecture", text: "The Rang Ghar is a two-storied building which once served as the royal sports-pavilion where Ahom kings and nobles were spectators at games like buffalo fights and other sports at Rupahi Pathar.", image: "", caption: "" }
    ],
    infobox: [{ label: "Location", value: "Rangpur" }, { label: "Builder", value: "Pramatta Singha" }] 
  },
  { 
    id: 2, 
    title: "Lachit Borphukan", 
    category: "people", 
    year: 1671, 
    summary: "The legendary commander who defeated the Mughals in the Battle of Saraighat.", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Lachit_Borphukan_statue_at_Hollongapar.jpg/360px-Lachit_Borphukan_statue_at_Hollongapar.jpg", 
    content: [],
    infobox: [{ label: "Role", value: "Borphukan (Commander)" }]
  },
  { 
    id: 3, 
    title: "Talatal Ghar", 
    category: "architecture", 
    year: 1751, 
    summary: "The multi-storied palace with underground tunnels used as a base by the Ahom kings.", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Talatal_Ghar.jpg/640px-Talatal_Ghar.jpg", 
    content: [],
    infobox: [{ label: "Location", value: "Rangpur" }]
  },
  { 
    id: 4, 
    title: "Chaolung Sukaphaa", 
    category: "kings", 
    year: 1228, 
    summary: "The founder of the Ahom Kingdom who established his capital at Charaideo.", 
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Sukaphaa_statue.jpg/360px-Sukaphaa_statue.jpg", 
    content: [],
    infobox: [{ label: "Reign", value: "1228–1268" }]
  },
];

const MOCK_RESOURCES = [
  { id: 1, title: "Ahom Administration System", author: "Dr. S. Baruah", type: "Academic Paper", url: "#" },
  { id: 2, title: "Architecture of Rangpur", author: "ASI Report 1998", type: "Official Report", url: "#" },
];

/**
 * ==========================================
 * TRANSLATIONS (Manual Keys)
 * ==========================================
 */
const TRANSLATIONS = {
  en: {
    appTitle: "Sibsagar Digital",
    subtitle: "A Comprehensive Digital Archive of Ahom Heritage",
    explore: "EXPLORE",
    home: "HOME GRID",
    timeline: "CHRONOLOGY",
    map: "MAP ROOM",
    tree: "ROYAL LINEAGE",
    gallery: "DIGITAL GALLERY",
    saved: "SAVED COLLECTION",
    collections: "COLLECTIONS",
    learn: "LEARN",
    quiz: "ROYAL CHALLENGE",
    admin: "CURATOR PORTAL",
    searchPlaceholder: "Search the archives...",
    readHistory: "Read History",
    seeAlso: "See Also",
    royalRecord: "Royal Record",
    return: "Return to Collection",
    est: "Est. 1228 CE",
    heroTitle: "The Golden Annals of the",
    heroSubtitle: "Ahom Kingdom",
    heroDesc: "Explore the history of the Swargadeos, the monumental architecture of Rangpur, and the unconquerable spirit of Lachit Borphukan.",
    viewTimeline: "View Timeline",
    takeQuiz: "Take Quiz",
    entries: "artifacts archived",
    noRecords: "No records found matching your criteria.",
    reset: "Reset Archive",
    quizCompleted: "Quiz Completed!",
    retake: "Retake Challenge",
    score: "You scored",
    glory: "Legacy Preserved",
    loginTitle: "Curator Access",
    loginDesc: "Enter credentials (Try admin/admin for demo)",
    username: "Username",
    password: "Password",
    loginBtn: "Access Archives",
    dashboard: "Admin Dashboard",
    addNew: "Add New Article",
    editItem: "Edit Article",
    manageContent: "Artifacts",
    managePages: "Pages & Info",
    manageResources: "Resources (PDF)",
    actions: "Actions",
    cancel: "Cancel",
    saveItem: "Save Changes",
    formTitle: "Article Title",
    formCategory: "Category",
    formYear: "Year",
    formSummary: "Short Summary",
    formImage: "Main Image URL",
    sections: "Article Sections (Wikipedia Style)",
    infobox: "Infobox Data",
    addSection: "Add Section",
    addRow: "Add Row",
    aboutProject: "About Project",
    authSpeech: "Authority Speech",
    research: "Research & Resources",
    districtInfo: "Sivasagar District",
    footerDev: "Developed by Department of Computer Science, Sibsagar University",
    footerRights: "© 2024 Sibsagar Digital. All Rights Preserved.",
    contactUs: "Contact Us",
    quickLinks: "Quick Links",
    resources: "Resources",
    address: "Sibsagar University, Joysagar, Assam 785665",
    email: "archive@sibsagaruniversity.ac.in",
    phone: "+91 3772 222222",
    share: "Share",
    shareTitle: "Share this Artifact",
    copyLink: "Copy Link",
    copied: "Copied!",
    didYouKnow: "Did You Know?",
    fact: "The Ahom Kingdom is the only dynasty in India that successfully defeated the Mughals 17 times.",
    cite: "Cite",
    citation: "Citation Copied",
    info: "INFORMATION",
    comments: "Community Discussion",
    postComment: "Post Comment",
    download: "Download PDF",
    zoom: "Zoom",
    messages: "Inbox",
    stats: "Overview",
    sectionHeader: "Header",
    sectionText: "Content...",
    sectionImg: "Section Image URL (Optional)",
    sectionCap: "Image Caption",
    uploadPdf: "Upload PDF Document",
    fileName: "File Name",
    fileType: "Document Type",
    msgSuccess: "Success",
    sysOnline: "Database Online",
    sysOffline: "Demo Mode (Offline)"
  },
  as: {
    appTitle: "শিৱসাগৰ ডিজিটেল",
    subtitle: "আহোম ঐতিহ্যৰ এক বিস্তৃত ডিজিটেল সংগ্ৰহ",
    explore: "অন্বেষণ",
    home: "মূল পৃষ্ঠা",
    timeline: "কালক্ৰম",
    map: "মানচিত্ৰ",
    tree: "বংশাৱলী",
    gallery: "চিত্ৰশালা",
    saved: "সংৰক্ষিত সংগ্ৰহ",
    collections: "বিভাগসমূহ",
    learn: "শিকক",
    quiz: "ৰাজকীয় প্ৰশ্নোত্তৰ",
    admin: "কিউৰেটৰ প্ৰৱেশ",
    searchPlaceholder: "সংগ্ৰহালয়ত অনুসন্ধান কৰক...",
    readHistory: "বুৰঞ্জী পঢ়ক",
    seeAlso: "অধিক চাওক",
    royalRecord: "ৰাজকীয় তথ্য",
    return: "উভতি যাওক",
    est: "স্থাপিত ১২২৮ খ্ৰীঃ",
    heroTitle: "আহোম সাম্ৰাজ্যৰ",
    heroSubtitle: "স্বৰ্ণিল ইতিহাস",
    heroDesc: "স্বৰ্গদেউসকলৰ ইতিহাস, ৰংপুৰৰ স্থাপত্য আৰু লাচিত বৰফুকনৰ অপৰাজেয় সাহসিকতা অন্বেষণ কৰক।",
    viewTimeline: "কালক্ৰম চাওক",
    takeQuiz: "প্ৰশ্নোত্তৰ",
    entries: "টা তথ্য সংৰক্ষিত",
    noRecords: "আপোনাৰ অনুসন্ধানৰ লগত মিল থকা কোনো তথ্য পোৱা নগল।",
    reset: "পুনৰাই আৰম্ভ কৰক",
    quizCompleted: "প্ৰশ্নোত্তৰ সমাপ্ত!",
    retake: "পুনৰ চেষ্টা কৰক",
    score: "আপোনাৰ স্ক'ৰ",
    glory: "ঐতিহ্য সংৰক্ষিত",
    loginTitle: "কিউৰেটৰ প্ৰৱেশ",
    loginDesc: "অনুগ্রহ কৰি আৰ্কাইভ পৰিচালনা কৰিবলৈ আপোনাৰ তথ্য প্ৰবিষ্ট কৰক।",
    username: "ব্যৱহাৰকাৰীৰ নাম",
    password: "পাচৱৰ্ড",
    loginBtn: "প্ৰৱেশ কৰক",
    dashboard: "প্ৰশাসকৰ ডেশ্ববৰ্ড",
    addNew: "নতুন যোগ কৰক",
    editItem: "সম্পাদনা কৰক",
    manageContent: "সমল পৰিচালনা",
    managePages: "পৃষ্ঠা আৰু তথ্য",
    manageResources: "সম্পদ (PDF)",
    actions: "কাৰ্যসমূহ",
    cancel: "বাতিল কৰক",
    saveItem: "সংৰক্ষণ কৰক",
    formTitle: "শিৰোনাম",
    formCategory: "বিভাগ",
    formYear: "বৰ্ষ",
    formSummary: "সাৰাংশ",
    formImage: "চিত্ৰ ইউ.আৰ.এল",
    sections: "বিষয়বস্তুৰ অংশ",
    infobox: "তথ্য পেৰা",
    addSection: "অংশ যোগ কৰক",
    addRow: "শাৰী যোগ কৰক",
    aboutProject: "প্ৰকল্পৰ বিষয়ে",
    authSpeech: "কৰ্তৃপক্ষৰ ভাষণ",
    research: "গৱেষণা আৰু সমল",
    districtInfo: "শিৱসাগৰ জিলা",
    footerDev: "কম্পিউটাৰ বিজ্ঞান বিভাগ, শিৱসাগৰ বিশ্ববিদ্যালয়ৰ দ্বাৰা বিকশিত",
    footerRights: "© ২০২৪ শিৱসাগৰ ডিজিটেল। সৰ্বস্বত্ব সংৰক্ষিত।",
    contactUs: "যোগাযোগ",
    quickLinks: "লিংকসমূহ",
    resources: "সমলসমূহ",
    address: "শিৱসাগৰ বিশ্ববিদ্যালয়, জয়সাগৰ, অসম ৭৮৫৬৬৫",
    email: "archive@sibsagaruniversity.ac.in",
    phone: "+৯১ ৩৭৭২ ২২২২২২",
    share: "শ্বেয়াৰ কৰক",
    shareTitle: "এই তথ্য শ্বেয়াৰ কৰক",
    copyLink: "লিংক কপি কৰক",
    copied: "কপি কৰা হ'ল!",
    didYouKnow: "আপুনি জানেনে?",
    fact: "আহোম সাম্ৰাজ্য ভাৰতৰ একমাত্ৰ ৰাজবংশ যিয়ে মোগলক ১৭ বাৰ সফলতাৰে পৰাজিত কৰিছিল।",
    cite: "উদ্ধৃতি",
    citation: "উদ্ধৃতি কপি কৰা হ'ল",
    info: "তথ্য",
    comments: "মন্তব্য",
    postComment: "পোষ্ট কৰক",
    download: "ডাউনলোড",
    zoom: "জুম",
    messages: "ইনবক্স",
    stats: "পৰ্যবেক্ষণ",
    sectionHeader: "শিৰোনাম",
    sectionText: "বিষয়বস্তু...",
    sectionImg: "ছবি লিংক (ঐচ্ছিক)",
    sectionCap: "ছবিৰ বিৱৰণ",
    uploadPdf: "PDF আপলোড কৰক",
    fileName: "ফাইলৰ নাম",
    fileType: "ফাইলৰ ধৰণ",
    msgSuccess: "সফল",
    sysOnline: "সিস্টেম সক্ৰিয়",
    sysOffline: "চাৰ্ভাৰ সংযোগ বিচ্ছিন্ন"
  },
  hi: {
    appTitle: "शिवसागर डिजिटल",
    subtitle: "अहोम विरासत का एक व्यापक डिजिटल संग्रह",
    explore: "अन्वेषण",
    home: "मुख्य पृष्ठ",
    timeline: "कालक्रम",
    map: "मानचित्र कक्ष",
    tree: "शाही वंशावली",
    gallery: "डिजिटल गैलरी",
    saved: "सहेजा गया संग्रह",
    collections: "संग्रह",
    learn: "सीखें",
    quiz: "शाही प्रश्नोत्तरी",
    admin: "क्यूरेटर पोर्टल",
    searchPlaceholder: "अभिलेखागार खोजें...",
    readHistory: "इतिहास पढ़ें",
    seeAlso: "यह भी देखें",
    royalRecord: "शाही रिकॉर्ड",
    return: "संग्रह पर वापस",
    est: "स्थापना १२२८ ई",
    heroTitle: "अहोम साम्राज्य का",
    heroSubtitle: "स्वर्णिम इतिहास",
    heroDesc: "स्वर्गदेवों के इतिहास, रंगपुर की स्मारक वास्तुकला और लचित बोरफुकन की अदम्य भावना का अन्वेषण करें।",
    viewTimeline: "कालक्रम देखें",
    takeQuiz: "प्रश्नोत्तरी लें",
    entries: "कलाकृतियां संग्रहीत",
    noRecords: "आपके मानदंडों से मेल खाने वाले कोई रिकॉर्ड नहीं मिले।",
    reset: "रीसेट करें",
    quizCompleted: "प्रश्नोत्तरी पूर्ण!",
    retake: "पुनः प्रयास करें",
    score: "आपका स्कोर",
    glory: "विरासत संरक्षित",
    loginTitle: "क्यूरेटर लॉगिन",
    loginDesc: "कृपया अभिलेखागार का प्रबंधन करने के लिए अपना विवरण दर्ज करें।",
    username: "उपयोगकर्ता नाम",
    password: "पासवर्ड",
    loginBtn: "प्रवेश करें",
    dashboard: "एडमिन डैशबोर्ड",
    addNew: "नई वस्तु जोड़ें",
    editItem: "संपादित करें",
    manageContent: "सामग्री प्रबंधन",
    managePages: "पृष्ठ और जानकारी",
    manageResources: "संसाधन (PDF)",
    actions: "क्रियाएं",
    cancel: "रद्द करें",
    saveItem: "सहेजें",
    formTitle: "शीर्षक",
    formCategory: "श्रेणी",
    formYear: "वर्ष",
    formSummary: "सारांश",
    formImage: "छवि URL",
    sections: "सामग्री अनुभाग",
    infobox: "इन्फोबॉक्स डेटा",
    addSection: "अनुभाग जोड़ें",
    addRow: "पंक्ति जोड़ें",
    aboutProject: "परियोजना के बारे में",
    authSpeech: "प्राधिकरण भाषण",
    research: "अनुसंधान और संसाधन",
    districtInfo: "शिवसागर जिला",
    footerDev: "कंप्यूटर विज्ञान विभाग, शिवसागर विश्वविद्यालय द्वारा विकसित",
    footerRights: "© २०२४ शिवसागर डिजिटल। सर्वाधिकार सुरक्षित।",
    contactUs: "संपर्क करें",
    quickLinks: "त्वरित लिंक",
    resources: "संसाधन",
    address: "शिवसागर विश्वविद्यालय, जयसागर, असम ७८५६६५",
    email: "archive@sibsagaruniversity.ac.in",
    phone: "+९१ ३७७२ २२२२२२",
    share: "साझा करें",
    shareTitle: "इस जानकारी को साझा करें",
    copyLink: "लिंक कॉपी करें",
    copied: "कॉपी किया गया!",
    didYouKnow: "क्या आप जानते हैं?",
    fact: "अहोम साम्राज्य भारत का एकमात्र राजवंश है जिसने मुगलों को १७ बार सफलतापूर्वक हराया।",
    cite: "उद्धरण",
    citation: "उद्धरण कॉपी किया गया",
    info: "जानकारी",
    comments: "टिप्पणियाँ",
    postComment: "पोस्ट करें",
    download: "डाउनलोड",
    zoom: "ज़ूम",
    messages: "इनबॉक्स",
    stats: "अवलोकन",
    sectionHeader: "शीर्षक",
    sectionText: "सामग्री...",
    sectionImg: "छवि लिंक (वैकल्पिक)",
    sectionCap: "छवि कैप्शन",
    uploadPdf: "PDF अपलोड करें",
    fileName: "फ़ाइल का नाम",
    fileType: "फ़ाइल प्रकार",
    msgSuccess: "सफल",
    sysOnline: "सिस्टम ऑनलाइन",
    sysOffline: "सर्वर डिस्कनेक्ट"
  }
};

/**
 * ==========================================
 * COMPONENT: Timeline Item
 * ==========================================
 */
const TimelineItem = ({ item, isDarkMode, onClick }) => (
  <div onClick={onClick} className="relative mb-10 ml-6 cursor-pointer group animate-in slide-in-from-right duration-500">
    <div className={`absolute -left-[41px] flex items-center justify-center w-8 h-8 rounded-full ring-4 ${isDarkMode ? 'bg-stone-800 ring-stone-900 text-amber-500' : 'bg-amber-100 ring-stone-50 text-amber-600'}`}>
        <Crown className="w-4 h-4" />
    </div>
    <div className={`p-4 rounded-lg border shadow-sm transition-all group-hover:scale-[1.02] group-hover:shadow-md ${isDarkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'}`}>
        <div className="flex flex-col md:flex-row gap-4">
            {item.image && <img src={item.image} alt={item.title} className="w-full md:w-32 h-32 object-cover rounded-md" />}
            <div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${isDarkMode ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-800'}`}>{item.year} CE</span>
                <h3 className={`text-xl font-bold font-serif mt-2 ${isDarkMode ? 'text-stone-100' : 'text-stone-800'}`}>{item.title}</h3>
                <p className={`text-sm mt-2 line-clamp-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-600'}`}>{item.summary}</p>
            </div>
        </div>
    </div>
  </div>
);

/**
 * ==========================================
 * MAIN COMPONENT
 * ==========================================
 */
const App = () => {
  const [view, setView] = useState('grid'); 
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeArticleId, setActiveArticleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lang, setLang] = useState('en'); 
  
  // Data States - Populated via API
  const [dbItems, setDbItems] = useState([]);
  const [resources, setResources] = useState([]);
  
  // Connection Status
  const [backendOnline, setBackendOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cmsContent, setCmsContent] = useState(INITIAL_CMS);

  // Auth States
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAdminMode, setIsAdminMode] = useState(!!localStorage.getItem('token'));
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // UI States
  const [fontSize, setFontSize] = useState(16);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  
  // Forms
  const [newItem, setNewItem] = useState({ 
      title: '', category: 'kings', year: '', summary: '', image: '', 
      content: [{ header: '', text: '', image: '', caption: '' }], 
      infobox: [{ label: '', value: '' }] 
  });
  const [newResource, setNewResource] = useState({ title: '', author: '', type: 'Academic Paper', url: '' });
  const [adminTab, setAdminTab] = useState('content'); 
  const [editingCms, setEditingCms] = useState(null); 
  const [tempCmsText, setTempCmsText] = useState('');

  // Comments & Inbox
  const [comments, setComments] = useState({}); 
  const [newComment, setNewComment] = useState('');
  
  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const t = (key) => TRANSLATIONS[lang][key] || TRANSLATIONS['en'][key];

  // Theme Config
  const theme = isDarkMode ? {
    bg: "bg-stone-950",
    sidebar: "bg-stone-900 border-stone-800",
    sidebarHeader: "bg-stone-900",
    header: "bg-stone-900/90 border-stone-800",
    text: "text-stone-200",
    textMuted: "text-stone-400",
    card: "bg-stone-900 border-stone-800 hover:border-amber-700",
    accent: "text-amber-500",
    accentBg: "bg-amber-900/30 text-amber-400",
    input: "bg-stone-800 border-stone-700 text-stone-200 placeholder-stone-500 focus:ring-amber-900",
    divider: "border-stone-800",
    activeNav: "bg-stone-800 text-amber-400 border-amber-800",
    inactiveNav: "text-stone-400 hover:bg-stone-800"
  } : {
    bg: "bg-stone-50",
    sidebar: "bg-white border-stone-200",
    sidebarHeader: "bg-stone-50",
    header: "bg-white/80 border-stone-200",
    text: "text-stone-900",
    textMuted: "text-stone-600",
    card: "bg-white border-stone-200 hover:border-amber-300",
    accent: "text-amber-700",
    accentBg: "bg-amber-50 text-amber-900",
    input: "bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:ring-amber-500/30",
    divider: "border-stone-200",
    activeNav: "bg-amber-50 text-amber-900 border-amber-200",
    inactiveNav: "text-stone-600 hover:bg-stone-100"
  };

  /**
   * ==========================================
   * BACKEND INTEGRATION
   * ==========================================
   */

  const fetchItems = async () => {
      setIsLoading(true);
      try {
          const res = await fetch(`${API_URL}/items`);
          if (!res.ok) throw new Error("Server error");
          const data = await res.json();
          setDbItems(data);
          setBackendOnline(true);
      } catch (err) {
          console.log("Using Mock Data (Backend Offline)");
          setBackendOnline(false);
          setDbItems(MOCK_ITEMS); // FALLBACK TO MOCK DATA
      } finally {
          setIsLoading(false);
      }
  };

  const fetchResources = async () => {
      try {
          const res = await fetch(`${API_URL}/resources`);
          if (res.ok) {
              const data = await res.json();
              setResources(data);
          } else {
            setResources(MOCK_RESOURCES);
          }
      } catch (err) {
          console.log("Using Mock Resources");
          setResources(MOCK_RESOURCES);
      }
  };

  const fetchPages = async () => {
      try {
          const res = await fetch(`${API_URL}/pages`);
          if (res.ok) {
              const data = await res.json();
              setCmsContent(prev => ({...prev, ...data}));
          }
      } catch (err) {
          console.log("Using Mock Pages");
          // Initial CMS is already set as default
      }
  };

  useEffect(() => {
      fetchItems();
      fetchResources();
      fetchPages();

      // Initialize Google Translate Script safely
      window.googleTranslateElementInit = () => {
        if(window.google && window.google.translate) {
            new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,as', // English, Hindi, Assamese
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
            }, 'google_translate_element');
        }
      };
      
      const script = document.createElement('script');
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () => console.log("Google Translate blocked or failed to load - translation features disabled");
      document.body.appendChild(script);

      return () => {
        // Cleanup if necessary
      }
  }, []);

  const changeLanguage = (languageCode) => {
    setLang(languageCode);
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
    // Set the cookie that Google Translate looks for
    document.cookie = `googtrans=/en/${languageCode}; expires=${date.toUTCString()}; path=/`;
    document.cookie = `googtrans=/en/${languageCode}; expires=${date.toUTCString()}; path=/domain`;
    window.location.reload(); // Reload to apply translation
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // DEMO BACKDOOR FOR PREVIEW
    if (username === 'admin' && password === 'admin') {
        localStorage.setItem('token', 'demo-token'); 
        setToken('demo-token');
        setIsAdminMode(true);
        setView('admin');
        setLoginError('');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token); 
            setToken(data.token);
            setIsAdminMode(true);
            setView('admin');
            setLoginError('');
        } else {
            setLoginError(data.error || 'Invalid credentials');
        }
    } catch (err) {
        setLoginError('Server offline. Use admin/admin for demo.');
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      setToken(null);
      setIsAdminMode(false);
      setView('grid');
  };

  const handleSaveItem = async (e) => {
      e.preventDefault();
      // Demo Mode Handling
      if (!backendOnline) {
          const newItemWithId = { ...newItem, id: Date.now() };
          setDbItems(prev => [newItemWithId, ...prev]);
          setShowAddModal(false);
          setNewItem({ title: '', category: 'kings', year: '', summary: '', image: '', content: [{ header: '', text: '', image: '', caption: '' }], infobox: [{ label: '', value: '' }] });
          alert('Item saved locally (Demo Mode)');
          return;
      }

      try {
          const res = await fetch(`${API_URL}/items`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify(newItem)
          });
          
          if (res.ok) {
              alert('Artifact saved to database successfully!');
              setShowAddModal(false);
              fetchItems(); 
              setNewItem({ title: '', category: 'kings', year: '', summary: '', image: '', content: [{ header: '', text: '', image: '', caption: '' }], infobox: [{ label: '', value: '' }] });
          } else {
              const err = await res.json();
              alert(`Failed to save: ${err.error}`);
          }
      } catch (err) {
          alert("Network error: Could not save to database.");
      }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure? This will delete the record.")) return;
      
      if (!backendOnline) {
          setDbItems(prev => prev.filter(i => i.id !== id));
          return;
      }

      try {
          const res = await fetch(`${API_URL}/items/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              fetchItems(); 
          } else {
              alert("Failed to delete item.");
          }
      } catch (err) { 
          alert("Network error during deletion.");
      }
  };

  const handleSaveResource = async (e) => {
      e.preventDefault();
      if (!backendOnline) {
          setResources(prev => [...prev, { ...newResource, id: Date.now() }]);
          setShowResourceModal(false);
          setNewResource({ title: '', author: '', type: 'Academic Paper', url: '' });
          alert("Resource added (Demo Mode)");
          return;
      }

      try {
          const res = await fetch(`${API_URL}/resources`, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify(newResource)
          });
          if(res.ok) {
              alert('Resource added to library.');
              setShowResourceModal(false);
              setNewResource({ title: '', author: '', type: 'Academic Paper', url: '' });
              fetchResources();
          } else {
              alert("Failed to add resource.");
          }
      } catch (err) { alert(err.message); }
  };

  // Convert File to Base64 for database storage (simulating file upload)
  const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          if (file.size > 500000) { // Limit to 500KB to avoid crashing local db
              alert("File is too large for the demo database. Please provide a URL instead.");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setNewResource(prev => ({...prev, url: reader.result}));
          };
          reader.readAsDataURL(file);
      }
  };

  const handlePostComment = () => {
      if(!newComment.trim()) return;
      const commentObj = {
          user: "Guest User",
          text: newComment,
          date: new Date().toLocaleDateString()
      };
      setComments(prev => ({
          ...prev,
          [activeArticleId]: [...(prev[activeArticleId] || []), commentObj]
      }));
      setNewComment('');
  };

  const handleSaveCms = async (key) => {
      if (!backendOnline) {
         setCmsContent(prev => ({ ...prev, [key]: { ...prev[key], text: tempCmsText } }));
         setEditingCms(null);
         alert("Page updated locally (Demo Mode)");
         return;
      }

      try {
          // Construct the payload based on what backend expects
          const payload = { ...cmsContent[key], text: tempCmsText };
          
          const res = await fetch(`${API_URL}/pages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ page: key, content: payload })
          });

          if (res.ok) {
             setCmsContent(prev => ({ ...prev, [key]: { ...prev[key], text: tempCmsText } }));
             setEditingCms(null);
             alert("Page content updated in database.");
          } else {
              alert("Failed to save page content.");
          }
      } catch (err) {
          alert("Network error saving page content.");
      }
  };

  const filteredData = useMemo(() => {
    let data = dbItems;
    if (activeCategory === 'saved') {
      data = data.filter(item => savedIds.includes(item.id));
    } else if (activeCategory !== 'all') {
      data = data.filter(item => item.category === activeCategory);
    }
    if (searchQuery.trim()) {
      data = data.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (view === 'tree') {
        return [...data].filter(i => i.category === 'kings').sort((a, b) => (a.lineageOrder || 999) - (b.lineageOrder || 999));
    }
    return data;
  }, [activeCategory, searchQuery, dbItems, savedIds, view]);

  const activeArticle = useMemo(() => dbItems.find(item => item.id === activeArticleId), [activeArticleId, dbItems]);
  const relatedArticles = useMemo(() => {
    if (!activeArticle) return [];
    return dbItems.filter(item => 
      item.id !== activeArticle.id && 
      (item.category === activeArticle.category || Math.abs(item.year - activeArticle.year) < 50)
    ).slice(0, 3);
  }, [activeArticle, dbItems]);

  const toggleSave = (e, id) => {
    e.stopPropagation();
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (activeArticle) {
      const text = `${activeArticle.title}. ${activeArticle.summary}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      if(lang === 'as') utterance.lang = 'bn-IN';
      if(lang === 'hi') utterance.lang = 'hi-IN';
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const copyToClipboard = () => {
      const dummyUrl = `https://sibsagardigital.in/archive/${activeArticleId}`;
      navigator.clipboard.writeText(dummyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const updateContentSection = (idx, field, value) => {
      const newContent = [...newItem.content];
      newContent[idx][field] = value;
      setNewItem({...newItem, content: newContent});
  };
  const addContentSection = () => setNewItem({...newItem, content: [...newItem.content, { header: '', text: '', image: '', caption: '' }]});
  const removeContentSection = (idx) => setNewItem({...newItem, content: newItem.content.filter((_, i) => i !== idx)});
  const updateInfoboxRow = (idx, field, value) => {
      const newInfobox = [...newItem.infobox];
      newInfobox[idx][field] = value;
      setNewItem({...newItem, infobox: newInfobox});
  };
  const addInfoboxRow = () => setNewItem({...newItem, infobox: [...newItem.infobox, { label: '', value: '' }]});
  const removeInfoboxRow = (idx) => setNewItem({...newItem, infobox: newItem.infobox.filter((_, i) => i !== idx)});
  const handleEditClick = (item) => { setNewItem({...item, content: item.content || [], infobox: item.infobox || []}); setShowAddModal(true); };

  const handleQuizAnswer = (idx) => {
    setSelectedAnswer(idx);
    setTimeout(() => {
      if (idx === QUIZ_QUESTIONS[currentQuestion].correct) setQuizScore(s => s + 1);
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion(c => c + 1);
        setSelectedAnswer(null);
      } else {
        setShowQuizResult(true);
      }
    }, 800);
  };
  const resetQuiz = () => { setCurrentQuestion(0); setQuizScore(0); setShowQuizResult(false); setSelectedAnswer(null); };

  const InfoPage = ({ pageKey, icon: Icon }) => {
    const content = cmsContent[pageKey] || { text: "Loading...", title: "..." };
    return (
      <div className="max-w-4xl mx-auto p-8 animate-in fade-in duration-500 min-h-[60vh]">
          <div className="mb-8 border-b pb-4 border-stone-300">
              <h1 className={`text-4xl font-serif font-bold mb-2 flex items-center gap-3 ${theme.text}`}>
                  <Icon className="w-8 h-8 text-amber-600" />
                  {t(pageKey === 'about' ? 'aboutProject' : pageKey === 'speech' ? 'authSpeech' : 'districtInfo')}
              </h1>
          </div>
          <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''} whitespace-pre-wrap ${theme.text}`}>
              {content.text}
          </div>
      </div>
    );
  };
  
  return (
    <div className={`flex h-screen ${theme.bg} ${theme.text} font-sans overflow-hidden transition-colors duration-300 ${lang === 'as' ? 'lang-as' : (lang === 'hi' ? 'lang-hi' : '')}`}>
      
      {/* GLOBAL STYLES & GOOGLE TRANSLATE HACK */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Noto+Serif+Bengali:wght@400;700&display=swap');
        
        body, .font-serif {
            font-family: 'Noto Serif', 'Noto Serif Bengali', serif !important;
        }

        /* * =========================================
         * HIDDEN GOOGLE TRANSLATE STYLES
         * =========================================
         */
        
        /* Hide the top banner frame completely - targeting iframe specifically */
        .goog-te-banner-frame.skiptranslate, 
        .goog-te-banner-frame, 
        iframe.goog-te-banner-frame {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            width: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
            position: absolute !important;
            z-index: -1000 !important;
        } 
        
        /* Reset body top property forced by Google */
        body {
            top: 0px !important; 
            position: static !important;
            margin-top: 0px !important;
        }
        
        /* Hide the element itself */
        #google_translate_element {
            display: none;
        }
        
        /* Hide tooltips and popups on hover */
        .goog-tooltip, 
        #goog-gt-tt, 
        .goog-te-balloon-frame {
            display: none !important;
            visibility: hidden !important;
        }
        
        .goog-text-highlight {
            background-color: transparent !important;
            border: none !important; 
            box-shadow: none !important;
        }

        /* Specific fix for the top margin issue sometimes caused by the script */
        font {
            background-color: transparent !important;
            box-shadow: none !important;
        }

        /* Sidebar scrollbar styles for cleaner look */
        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #d6d3d1;
          border-radius: 3px;
        }
        .dark .sidebar-scroll::-webkit-scrollbar-thumb {
          background-color: #44403c;
        }
      `}</style>
      
      {/* Hidden Translate Element */}
      <div id="google_translate_element"></div>

      {/* Lightbox */}
      {lightboxImg && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300" onClick={() => setLightboxImg(null)}>
              <img src={lightboxImg} alt="Fullscreen" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
              <button className="absolute top-6 right-6 text-white hover:text-amber-500"><X className="w-8 h-8" /></button>
          </div>
      )}
      
      {/* Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 ${theme.sidebar} border-r z-40 flex flex-col shadow-xl md:shadow-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform`}>
        <div className={`p-6 border-b ${theme.sidebarHeader} flex flex-col gap-2 ${theme.divider}`}>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setView('grid'); setActiveArticleId(null); }}>
            <img src={LOGO_URL} alt="Logo" className="w-10 h-10 object-contain rounded" />
            <span className={`font-serif font-bold text-xl leading-tight ${isDarkMode ? 'text-stone-100' : 'text-stone-800'}`}>{t('appTitle')}</span>
          </div>
          <p className={`text-[10px] italic pl-1 border-l-2 border-amber-500 ml-1 ${theme.textMuted}`}>{t('subtitle')}</p>
          {backendOnline ? (
              <span className="flex items-center gap-2 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded w-fit mt-2">
                  <Wifi className="w-3 h-3" /> ONLINE
              </span>
          ) : (
              <span className="flex items-center gap-2 text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded w-fit mt-2">
                  <WifiOff className="w-3 h-3" /> DEMO MODE
              </span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto sidebar-scroll p-4 space-y-1">
          <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ml-2 mt-2 ${theme.textMuted}`}>{t('explore')}</div>
          {['home', 'timeline', 'map', 'tree', 'gallery'].map((key) => (
             <button key={key} onClick={() => { setView(key === 'home' ? 'grid' : key); setActiveArticleId(null); setIsSidebarOpen(false); if(key==='timeline') setActiveCategory('all'); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${view === (key==='home'?'grid':key) ? theme.activeNav : theme.inactiveNav}`}>
                {key === 'home' && <Home className="w-4 h-4" />}
                {key === 'timeline' && <Clock className="w-4 h-4" />}
                {key === 'map' && <MapPin className="w-4 h-4" />}
                {key === 'tree' && <GitMerge className="w-4 h-4" />}
                {key === 'gallery' && <ImageIcon className="w-4 h-4" />}
                {t(key)}
             </button>
          ))}
          
          <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ml-2 mt-4 ${theme.textMuted}`}>{t('saved')}</div>
           <button onClick={() => { setActiveCategory('saved'); setActiveArticleId(null); setView('grid'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${activeCategory === 'saved' ? theme.activeNav : theme.inactiveNav}`}>
            <Bookmark className="w-4 h-4" /> {t('saved')}
            {savedIds.length > 0 && <span className="ml-auto bg-amber-600 text-white text-[10px] px-1.5 rounded-full">{savedIds.length}</span>}
          </button>

          <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ml-2 mt-4 ${theme.textMuted}`}>{t('collections')}</div>
          {CATEGORIES.slice(1).map(cat => (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setActiveArticleId(null); setView('grid'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${activeCategory === cat.id ? theme.activeNav : theme.inactiveNav}`}>
              <cat.icon className="w-4 h-4 opacity-70" />
              <span>{lang === 'as' ? cat.labelAs : (lang === 'hi' ? cat.labelHi : cat.label)}</span>
            </button>
          ))}

          <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ml-2 mt-4 ${theme.textMuted}`}>{t('info')}</div>
          {/* NEW SIDEBAR LINKS */}
          <button onClick={() => { setView('about'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${view === 'about' ? theme.activeNav : theme.inactiveNav}`}>
              <Info className="w-4 h-4" /> {t('aboutProject')}
          </button>
          <button onClick={() => { setView('research'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${view === 'research' ? theme.activeNav : theme.inactiveNav}`}>
              <GraduationCap className="w-4 h-4" /> {t('research')}
          </button>
          <button onClick={() => { setView('speech'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${view === 'speech' ? theme.activeNav : theme.inactiveNav}`}>
              <Building2 className="w-4 h-4" /> {t('authSpeech')}
          </button>

          <div className={`mt-6 pt-4 border-t ${theme.divider}`}>
             <button onClick={() => { if(token) { setIsAdminMode(true); setView('admin'); } else setView('login'); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${view === 'admin' || view === 'login' ? theme.activeNav : theme.inactiveNav}`}>
                <Lock className="w-4 h-4" /> {token ? t('admin') : t('admin')}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative print-full-width">
        <header className={`h-16 border-b backdrop-blur-md flex items-center px-4 md:px-8 justify-between shrink-0 z-10 sticky top-0 ${theme.header} ${theme.divider}`}>
          <div className="flex items-center gap-4 w-full">
            <button className={`md:hidden p-2 rounded-md ${theme.inactiveNav}`} onClick={() => setIsSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div className="flex-1 max-w-xl relative">
               {['grid', 'timeline', 'article', 'gallery', 'quiz'].includes(view) && (
                 <>
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className={`h-4 w-4 ${theme.textMuted}`} /></div>
                   <input type="text" className={`block w-full pl-10 pr-3 py-2 border rounded-full leading-5 sm:text-sm transition-all shadow-sm focus:outline-none focus:ring-2 ${theme.input}`} placeholder={t('searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                 </>
               )}
            </div>
            <div className="flex items-center gap-4">
                <div className={`flex items-center border rounded-full overflow-hidden ${theme.divider}`}>
                    <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className={`px-2 py-1 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs ${theme.text}`}><MinusCircle className="w-3 h-3" /></button>
                    <span className={`px-2 text-xs font-bold ${theme.text}`}><Type className="w-3 h-3 inline mr-1" />{fontSize}</span>
                    <button onClick={() => setFontSize(s => Math.min(24, s + 2))} className={`px-2 py-1 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs ${theme.text}`}><PlusCircle className="w-3 h-3" /></button>
                </div>
                {/* Updated Language Switcher triggers Google Translate */}
                <div className={`flex items-center border rounded overflow-hidden ${theme.divider} notranslate`}>
                    <button onClick={() => changeLanguage('en')} className={`px-3 py-1 text-xs font-bold ${lang === 'en' ? 'bg-amber-600 text-white' : `hover:bg-stone-200 ${theme.text}`}`}>EN</button>
                    <button onClick={() => changeLanguage('hi')} className={`px-3 py-1 text-xs font-bold ${lang === 'hi' ? 'bg-amber-600 text-white' : `hover:bg-stone-200 ${theme.text}`}`}>HI</button>
                    <button onClick={() => changeLanguage('as')} className={`px-3 py-1 text-xs font-bold ${lang === 'as' ? 'bg-amber-600 text-white' : `hover:bg-stone-200 ${theme.text}`}`}>AS</button>
                </div>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-stone-800 text-amber-400' : 'hover:bg-stone-100 text-stone-600'}`}>{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth p-0">
            
            {/* CONNECTION ERROR STATE - MODIFIED FOR DEMO MODE */}
            {!backendOnline && !isLoading && (
                <div className="w-full bg-orange-50 border-b border-orange-200 p-2 text-center text-xs text-orange-800 font-bold flex items-center justify-center gap-2">
                    <WifiOff className="w-3 h-3" />
                    Demo Mode Active: Backend Unavailable (Using mock data)
                </div>
            )}

            {/* LOADING STATE */}
            {isLoading && (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                </div>
            )}

            {/* MAIN VIEWS (Show regardless of backend online status now) */}
            {!isLoading && (
                <>
                    {/* ADMIN DASHBOARD */}
                    {view === 'admin' && token ? (
                        <div className="max-w-7xl mx-auto p-6 md:p-12 animate-in fade-in duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className={`text-3xl font-serif font-bold ${theme.text}`}>{t('dashboard')}</h2>
                                    <p className={theme.textMuted}>Manage the Sibsagar Digital Archives</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-sm font-bold flex items-center gap-2 px-3 py-1 rounded-full border ${backendOnline ? 'text-green-600 bg-green-50 border-green-200' : 'text-orange-600 bg-orange-50 border-orange-200'}`}>
                                        <Database className="w-4 h-4" /> {backendOnline ? t('sysOnline') : t('sysOffline')}
                                    </span>
                                    <button onClick={handleLogout} className="px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2">
                                        <LogOut className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            </div>
                            
                            <div className={`flex gap-4 mb-6 border-b ${theme.divider}`}>
                                <button onClick={() => setAdminTab('content')} className={`pb-2 px-4 font-bold transition-colors ${adminTab === 'content' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-stone-400 hover:text-stone-600'}`}>{t('manageContent')}</button>
                                <button onClick={() => setAdminTab('pages')} className={`pb-2 px-4 font-bold transition-colors ${adminTab === 'pages' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-stone-400 hover:text-stone-600'}`}>{t('managePages')}</button>
                                <button onClick={() => setAdminTab('resources')} className={`pb-2 px-4 font-bold transition-colors ${adminTab === 'resources' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-stone-400 hover:text-stone-600'}`}>{t('manageResources')}</button>
                            </div>

                            {adminTab === 'content' && (
                                <div className={`rounded-xl border shadow-sm overflow-hidden ${theme.card}`}>
                                    <div className={`p-4 border-b ${theme.divider} flex justify-between items-center`}>
                                        <span className={`font-bold ${theme.text}`}>Artifact Registry</span>
                                        <button onClick={() => { setNewItem({ title: '', category: 'kings', year: '', summary: '', image: '', content: [{ header: '', text: '', image: '', caption: '' }], infobox: [{ label: '', value: '' }] }); setShowAddModal(true); }} className="bg-amber-600 text-white px-4 py-2 rounded-lg flex gap-2 text-sm font-bold hover:bg-amber-700 shadow-sm"><Plus className="w-4 h-4" /> {t('addNew')}</button>
                                    </div>
                                    <table className="w-full text-left border-collapse">
                                        <thead className={`text-xs uppercase font-bold ${isDarkMode ? 'bg-stone-900 text-stone-400' : 'bg-stone-100 text-stone-500'}`}>
                                            <tr><th className="p-4">Title</th><th className="p-4">Category</th><th className="p-4">Year</th><th className="p-4 text-right">Actions</th></tr>
                                        </thead>
                                        <tbody className={theme.text}>
                                            {dbItems.length === 0 ? (
                                                <tr><td colSpan="4" className="p-8 text-center text-stone-500 italic">No artifacts found.</td></tr>
                                            ) : (
                                                dbItems.map((item) => (
                                                    <tr key={item.id} className={`border-b last:border-0 hover:bg-stone-500/5 transition-colors ${theme.divider}`}>
                                                        <td className="p-4 font-medium">{item.title}</td>
                                                        <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${theme.accentBg}`}>{item.category}</span></td>
                                                        <td className="p-4 font-mono text-sm">{item.year}</td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                              <button onClick={() => handleEditClick(item)} className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"><Edit className="w-4 h-4" /></button>
                                                              <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            
                            {adminTab === 'pages' && (
                                <div className={`grid gap-4 ${theme.text}`}>
                                    {['about', 'speech', 'district'].map(key => (
                                        <div key={key} className={`p-6 rounded-lg border ${theme.card} flex justify-between items-center`}>
                                            <div>
                                                <h3 className="font-bold text-lg mb-1">{t(key === 'about' ? 'aboutProject' : key === 'speech' ? 'authSpeech' : 'districtInfo')}</h3>
                                                <p className={`text-sm ${theme.textMuted} line-clamp-1`}>{cmsContent[key]?.text || 'No content'}</p>
                                            </div>
                                            <button onClick={() => { setEditingCms(key); setTempCmsText(cmsContent[key]?.text || ''); }} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700">Edit Page</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                             {adminTab === 'resources' && (
                                <div className={`rounded-xl border shadow-sm overflow-hidden ${theme.card}`}>
                                    <div className={`p-4 border-b ${theme.divider} flex justify-between items-center`}>
                                        <span className={`font-bold ${theme.text}`}>Digital Library</span>
                                        <button onClick={() => setShowResourceModal(true)} className="bg-amber-600 text-white px-4 py-2 rounded-lg flex gap-2 text-sm font-bold hover:bg-amber-700 shadow-sm"><Plus className="w-4 h-4" /> {t('uploadPdf')}</button>
                                    </div>
                                    <ul className={`divide-y ${theme.divider}`}>
                                        {resources.map(res => (
                                            <li key={res.id} className="p-4 flex justify-between items-center hover:bg-stone-500/5">
                                                <div>
                                                    <div className={`font-bold ${theme.text}`}>{res.title}</div>
                                                    <div className={`text-sm ${theme.textMuted}`}>{res.author} • {res.type}</div>
                                                    {res.url && <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1"><LinkIcon className="w-3 h-3"/> View Document</a>}
                                                </div>
                                                <button onClick={() => handleDelete(res.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                             )}
                        </div>
                    
                    /* LOGIN SCREEN */
                    ) : view === 'login' ? (
                        <div className="flex items-center justify-center h-full animate-in fade-in zoom-in-95 duration-300 p-4">
                            <div className={`max-w-md w-full p-8 rounded-xl shadow-2xl border ${theme.card}`}>
                                <div className="text-center mb-6">
                                    <div className="bg-amber-100 text-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8" />
                                    </div>
                                    <h2 className={`text-2xl font-bold font-serif ${theme.text}`}>{t('loginTitle')}</h2>
                                    <p className={`text-sm mt-2 ${theme.textMuted}`}>{t('loginDesc')}</p>
                                </div>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className={`text-xs font-bold uppercase mb-1 block ${theme.textMuted}`}>{t('username')}</label>
                                        <input type="text" className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${theme.input}`} value={username} onChange={(e) => setUsername(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className={`text-xs font-bold uppercase mb-1 block ${theme.textMuted}`}>{t('password')}</label>
                                        <input type="password" className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none ${theme.input}`} value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    </div>
                                    {loginError && <div className="p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {loginError}</div>}
                                    <button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-900/20 transition-all transform active:scale-95">{t('loginBtn')}</button>
                                </form>
                                <button onClick={() => setView('grid')} className={`w-full text-center mt-6 text-sm hover:underline ${theme.textMuted}`}>Return to Public Archive</button>
                            </div>
                        </div>

                    /* SINGLE ARTICLE VIEW */
                    ) : view === 'article' && activeArticle ? (
                        <article className="max-w-6xl mx-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 print-full-width">
                            {/* Share Modal */}
                            {showShareModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
                                    <div className={`w-full max-w-sm p-6 rounded-xl shadow-2xl border ${theme.card} relative`}>
                                        <button onClick={() => setShowShareModal(false)} className="absolute top-3 right-3 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
                                        <h3 className={`text-lg font-bold mb-4 ${theme.text}`}>{t('shareTitle')}</h3>
                                        <div className="flex gap-4 justify-center mb-6">
                                            <button className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"><Facebook className="w-5 h-5" /></button>
                                            <button className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600"><Twitter className="w-5 h-5" /></button>
                                            <button className="p-3 bg-pink-600 text-white rounded-full hover:bg-pink-700"><Instagram className="w-5 h-5" /></button>
                                        </div>
                                        <div className={`flex items-center gap-2 p-2 rounded border ${theme.divider} ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
                                            <span className={`text-xs truncate flex-1 ${theme.textMuted}`}>https://sibsagardigital.in/archive/{activeArticleId}</span>
                                            <button onClick={copyToClipboard} className={`text-xs font-bold px-3 py-1 rounded ${copied ? 'bg-green-500 text-white' : 'bg-stone-200 text-stone-700'}`}>
                                                {copied ? t('copied') : t('copyLink')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button onClick={() => setView('grid')} className={`mb-8 flex items-center text-sm font-medium ${theme.textMuted} hover:text-amber-600 transition-colors group no-print`}>
                                <div className={`border p-1.5 rounded-full mr-2 ${isDarkMode ? 'bg-stone-800 border-stone-700' : 'bg-white border-stone-200'}`}><ChevronRight className="w-4 h-4 rotate-180" /></div>
                                {t('return')}
                            </button>

                            <div className="flex flex-col xl:flex-row gap-10">
                                <div className="flex-1 min-w-0">
                                    <div className={`flex items-center justify-between mb-4`}>
                                        <div className={`flex items-center gap-3 text-sm font-bold tracking-wider uppercase ${theme.accent}`}>
                                            {CATEGORIES.find(c => c.id === activeArticle.category)?.icon && React.createElement(CATEGORIES.find(c => c.id === activeArticle.category).icon, { className: "w-4 h-4" })}
                                            <span>{CATEGORIES.find(c => c.id === activeArticle.category)?.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2 no-print">
                                            <button onClick={() => {
                                                navigator.clipboard.writeText(`${activeArticle.title}, Sibsagar Digital Archive.`);
                                                alert(t('citation'));
                                            }} className={`p-2 rounded-full hover:bg-stone-200/50 text-stone-400 hover:text-stone-600`} title={t('cite')}><Quote className="w-5 h-5" /></button>
                                            <button onClick={() => setShowShareModal(true)} className={`p-2 rounded-full hover:bg-stone-200/50 text-stone-400 hover:text-stone-600`} title="Share"><Share2 className="w-5 h-5" /></button>
                                            <button onClick={handleSpeak} className={`p-2 rounded-full ${isSpeaking ? 'bg-amber-100 text-amber-600 animate-pulse' : 'hover:bg-stone-200/50 text-stone-400 hover:text-stone-600'}`} title="Listen"><Volume2 className="w-5 h-5" /></button>
                                            <button onClick={(e) => toggleSave(e, activeArticle.id)} className={`p-2 rounded-full ${savedIds.includes(activeArticle.id) ? 'text-amber-600 bg-amber-50' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-200/50'}`} title="Save"><Bookmark className={`w-5 h-5 ${savedIds.includes(activeArticle.id) ? 'fill-current' : ''}`} /></button>
                                        </div>
                                    </div>
                                    <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 leading-tight ${theme.text}`}>{activeArticle.title}</h1>
                                    <div style={{ fontSize: `${fontSize}px` }} className={`p-6 rounded-xl border-l-4 border-amber-600 shadow-sm mb-10 font-serif leading-relaxed italic print-bg-white ${isDarkMode ? 'bg-stone-900/50 text-stone-300' : 'bg-white text-stone-700'}`}>
                                        "{activeArticle.summary}"
                                    </div>
                                    {activeArticle.content && activeArticle.content.map((section, idx) => (
                                        <section key={idx} className="mb-8 group">
                                            <h2 className={`text-2xl font-bold mb-4 flex items-center font-serif transition-colors ${theme.text} group-hover:text-amber-600`}>
                                                <span className="text-amber-500/50 mr-2 text-3xl">§</span>
                                                {section.header}
                                            </h2>
                                            {section.image && (
                                                <div className="float-right ml-6 mb-4 w-1/3">
                                                    <div className={`p-1 border rounded ${theme.divider} ${isDarkMode ? 'bg-stone-800' : 'bg-white'}`}>
                                                        <img src={section.image} alt={section.caption || "Section Image"} className="w-full h-auto cursor-zoom-in" onClick={() => setLightboxImg(section.image)} />
                                                        {section.caption && <p className={`text-xs text-center mt-1 italic ${theme.textMuted}`}>{section.caption}</p>}
                                                    </div>
                                                </div>
                                            )}
                                            <p style={{ fontSize: `${fontSize}px` }} className={`text-base leading-relaxed text-justify tracking-wide ${isDarkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                                                {section.text}
                                            </p>
                                            <div className="clear-both"></div>
                                        </section>
                                    ))}

                                    {/* Comments Section */}
                                    <div className={`mt-12 p-6 rounded-xl border ${theme.divider} ${isDarkMode ? 'bg-stone-900/50' : 'bg-stone-100/50'} no-print`}>
                                        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${theme.text}`}><MessageSquare className="w-5 h-5" /> {t('comments')}</h3>
                                        <div className="space-y-4 mb-6">
                                            {(comments[activeArticle.id] || []).map((c, i) => (
                                                <div key={i} className="p-3 bg-white dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-bold text-xs text-amber-600">{c.user}</span>
                                                        <span className={`text-xs ${theme.textMuted}`}>{c.date}</span>
                                                    </div>
                                                    <p className={`text-sm ${theme.text}`}>{c.text}</p>
                                                </div>
                                            ))}
                                            {(!comments[activeArticle.id] || comments[activeArticle.id].length === 0) && <p className={`text-sm italic ${theme.textMuted}`}>No comments yet. Be the first!</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                className={`flex-1 p-2 rounded border text-sm ${theme.input}`} 
                                                placeholder="Add a comment..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                            />
                                            <button onClick={handlePostComment} className="bg-amber-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-amber-700">{t('postComment')}</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full xl:w-80 shrink-0 space-y-8">
                                    <div className={`border ${theme.divider} shadow-lg rounded-lg overflow-hidden print-bg-white ${isDarkMode ? 'bg-stone-900' : 'bg-white'}`}>
                                        <div className={`p-3 text-center border-b ${theme.divider} ${isDarkMode ? 'bg-stone-800' : 'bg-[#E4DFC9]'}`}>
                                            <h3 className={`font-bold font-serif tracking-wide uppercase text-sm ${theme.text}`}>{t('royalRecord')}</h3>
                                        </div>
                                        {activeArticle.image && (
                                            <div className={`p-3 border-b ${theme.divider} ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
                                                <div className="cursor-zoom-in" onClick={() => setLightboxImg(activeArticle.image)}>
                                                    <img src={activeArticle.image} alt={activeArticle.title} className="w-full h-auto rounded border" />
                                                </div>
                                            </div>
                                        )}
                                        <table className="w-full text-sm text-left">
                                            <tbody>
                                                {activeArticle.infobox && activeArticle.infobox.map((info, idx) => (
                                                    <tr key={idx} className={`border-b last:border-0 ${theme.divider}`}>
                                                        <th className={`py-2 px-4 font-semibold w-2/5 align-top text-xs uppercase ${isDarkMode ? 'text-stone-500' : 'text-stone-600'}`}>{info.label}</th>
                                                        <td className={`py-2 px-4 font-medium ${isDarkMode ? 'text-stone-300' : 'text-stone-800'}`}>{info.value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {relatedArticles.length > 0 && (
                                        <div className={`rounded-lg p-5 border ${theme.divider} no-print ${isDarkMode ? 'bg-stone-900/50' : 'bg-[#EBE7DE]/50'}`}>
                                            <h4 className={`font-bold mb-4 font-serif flex items-center gap-2 ${theme.text}`}><Scroll className="w-4 h-4" /> {t('seeAlso')}</h4>
                                            <div className="space-y-3">
                                                {relatedArticles.map(item => (
                                                    <button key={item.id} onClick={() => { setActiveArticleId(item.id); window.scrollTo(0,0); }} className={`w-full text-left p-3 rounded border shadow-sm transition-all group ${isDarkMode ? 'bg-stone-800 border-stone-700 hover:border-amber-500' : 'bg-white border-stone-200 hover:border-amber-400 hover:shadow-md'}`}>
                                                        <div className={`font-bold text-sm group-hover:text-amber-600 ${theme.text}`}>{item.title}</div>
                                                        <div className={`text-xs mt-1 flex items-center gap-1 ${theme.textMuted}`}><span>{t('readHistory')}</span> <ArrowRight className="w-3 h-3" /></div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>

                    /* MAP VIEW */
                    ) : view === 'map' ? (
                        <div className={`h-full flex flex-col relative overflow-hidden ${isDarkMode ? 'bg-stone-900' : 'bg-stone-200'}`}>
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114041.04279093844!2d94.6062779!3d26.9829285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37471900f64c67b5%3A0x6b4f74d08b3c4f7a!2sSivasagar%2C%20Assam!5e1!3m2!1sen!2sin!4v1709664567890!5m2!1sen!2sin" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0, filter: isDarkMode ? 'invert(0.9) hue-rotate(180deg)' : 'none' }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Sivasagar Satellite Map"
                            ></iframe>
                            <div className={`absolute top-4 left-4 p-4 backdrop-blur-md rounded shadow border z-10 w-64 ${isDarkMode ? 'bg-stone-900/80 border-stone-700' : 'bg-white/80 border-stone-200'}`}>
                                <h3 className={`font-bold font-serif ${theme.text}`}>Sivasagar Satellite View</h3>
                                <p className={`text-xs mt-1 ${theme.textMuted}`}>Live Google Earth view of the historic capital region.</p>
                            </div>
                        </div>

                    /* TIMELINE VIEW */
                    ) : view === 'timeline' ? (
                        <div className="max-w-4xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
                            <div className="text-center mb-12">
                                <h2 className={`text-3xl font-serif font-bold mb-2 ${theme.text}`}>{t('timeline')} of the Ahom Kingdom</h2>
                                <p className={theme.textMuted}>A timeline of the 600-year glorious rule in the Brahmaputra Valley.</p>
                            </div>
                            <div className={`ml-4 md:ml-12 border-l-2 pl-8 space-y-0 ${isDarkMode ? 'border-stone-800' : 'border-stone-300'}`}>
                                {filteredData.map((item) => <TimelineItem key={item.id} item={item} isDarkMode={isDarkMode} onClick={() => { setActiveArticleId(item.id); setView('article'); }} />)}
                                <div className="relative pl-8 pt-4">
                                    <div className={`absolute -left-[9px] top-4 w-4 h-4 rounded-full border-2 border-white ${isDarkMode ? 'bg-stone-700' : 'bg-stone-300'}`} />
                                    <div className={`text-sm font-bold font-serif ${isDarkMode ? 'text-stone-600' : 'text-stone-400'}`}>1826 CE</div>
                                    <div className={`text-sm mt-1 italic ${theme.textMuted}`}>Treaty of Yandabo marks the end of Ahom rule.</div>
                                </div>
                            </div>
                        </div>

                    /* TREE VIEW */
) : view === 'tree' ? (
    <div className="max-w-5xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
        <div className="text-center mb-16">
            <h2 className={`text-3xl font-serif font-bold mb-2 ${theme.text}`}>{t('tree')} (Bongshawali)</h2>
            <p className={theme.textMuted}>The unbroken lineage of the Swargadeos of the Ahom Dynasty.</p>
        </div>
        <div className="flex flex-col items-center space-y-2">
            {filteredData.map((king, index) => (
                <div key={king.id} className="flex flex-col items-center group relative w-full">
                    {index > 0 && <div className={`h-8 w-0.5 ${isDarkMode ? 'bg-amber-800' : 'bg-amber-300'}`}></div>}
                    
                    {/* FIXED: Added spaces between classes and removed 'overflow-hiddentransition-all' merge */}
                    <div 
                        onClick={() => { setActiveArticleId(king.id); setView('article'); }} 
                        className={`relative p-4 rounded-lg border-2 w-full max-w-md cursor-pointer overflow-hidden transition-all hover:scale-105 hover:shadow-lg ${isDarkMode ? 'bg-stone-900 border-amber-900/50 hover:border-amber-500' : 'bg-white border-amber-200 hover:border-amber-500 shadow-sm'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-stone-800 text-amber-600' : 'bg-amber-50 text-amber-700'}`}>
                                <Crown className="w-6 h-6" />
                            </div>
                            
                            {/* FIXED: Added min-w-0 to the container to allow truncation/wrapping to work inside Flex */}
                            <div className="flex-1 min-w-0">
                                <div className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${theme.accent}`}>
                                    {king.year} CE
                                </div>
                                {/* FIXED: Added break-words to handle very long titles */}
                                <h3 className={`font-bold font-serif text-lg break-words ${theme.text}`}>
                                    {king.title}
                                </h3>
                                {/* FIXED: Ensure truncate works by having a defined width via min-w-0 on parent */}
                                <p className={`text-xs truncate ${theme.textMuted}`}>
                                    {king.summary}
                                </p>
                            </div>
                            
                            {/* FIXED: Removed the broken 'overflow-hidden text-wrap' from className string */}
                            <ChevronRight className={`w-5 h-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${theme.textMuted}`} />
                        </div>
                    </div>
                    {index < filteredData.length - 1 && <ArrowDown className={`w-4 h-4 mt-2 ${isDarkMode ? 'text-amber-800' : 'text-amber-300'}`} />}
                </div>
            ))}
            <div className={`mt-8 p-4 rounded border text-center text-sm ${isDarkMode ? 'bg-stone-900 border-stone-800 text-stone-500' : 'bg-stone-100 border-stone-200 text-stone-600'}`}>
                Continued... (Dynasty lasted until 1826)
            </div>
        </div>
    </div>

                    /* QUIZ VIEW */
                    ) : view === 'quiz' ? (
                        <div className="max-w-3xl mx-auto p-6 md:p-12 animate-in fade-in zoom-in-95 duration-500 h-full flex flex-col justify-center">
                            {!showQuizResult ? (
                            <div className={`rounded-2xl shadow-xl border overflow-hidden ${theme.card}`}>
                                <div className="bg-[#2C241B] p-6 text-white flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-amber-500">{t('quiz')}</h2>
                                        <p className="text-stone-400 text-sm">Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</p>
                                    </div>
                                    <Brain className="w-8 h-8 text-amber-500 opacity-80" />
                                </div>
                                <div className="p-8 md:p-12">
                                    <h3 className={`text-xl md:text-2xl font-bold mb-8 leading-snug ${theme.text}`}>{QUIZ_QUESTIONS[currentQuestion].question}</h3>
                                    <div className="space-y-4">
                                        {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => (
                                            <button key={idx} onClick={() => handleQuizAnswer(idx)} disabled={selectedAnswer !== null} className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${selectedAnswer === null ? `${isDarkMode ? 'border-stone-700 hover:border-amber-600 hover:bg-stone-800 text-stone-300' : 'border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-stone-800'}` : selectedAnswer === idx ? idx === QUIZ_QUESTIONS[currentQuestion].correct ? 'border-green-500 bg-green-500/10 text-green-600' : 'border-red-500 bg-red-500/10 text-red-600' : idx === QUIZ_QUESTIONS[currentQuestion].correct ? 'border-green-500 bg-green-500/10 text-green-600' : 'border-stone-200 opacity-50'}`}>
                                                <span className="font-medium text-lg">{option}</span>
                                                {selectedAnswer === idx && (idx === QUIZ_QUESTIONS[currentQuestion].correct ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className={`h-2 w-full ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`}><div className="h-full bg-amber-600 transition-all duration-300" style={{ width: `${((currentQuestion) / QUIZ_QUESTIONS.length) * 100}%` }} /></div>
                            </div>
                            ) : (
                            <div className={`rounded-2xl shadow-xl border overflow-hidden text-center p-12 ${theme.card}`}>
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${isDarkMode ? 'bg-amber-900/30' : 'bg-amber-100'}`}><Trophy className="w-12 h-12 text-amber-600" /></div>
                                <h2 className={`text-3xl font-serif font-bold mb-2 ${theme.text}`}>{t('quizCompleted')}</h2>
                                <p className={`mb-8 ${theme.textMuted}`}>{t('score')} <span className="font-bold text-amber-600 text-xl">{quizScore}</span> out of {QUIZ_QUESTIONS.length}</p>
                                <div className={`p-6 rounded-lg mb-8 max-w-md mx-auto ${isDarkMode ? 'bg-stone-800' : 'bg-stone-50'}`}><p className={`italic font-serif ${theme.text}`}>{quizScore === QUIZ_QUESTIONS.length ? "Incredible! You are truly a scholar of the Ahom Kingdom." : quizScore > 2 ? "Well done! You have a good grasp of the history." : "Keep exploring the archives to learn more about this golden era."}</p></div>
                                <button onClick={resetQuiz} className="bg-amber-600 text-white px-8 py-3 rounded-full font-bold hover:bg-amber-700 transition-colors shadow-lg shadow-amber-900/20">{t('retake')}</button>
                                <button onClick={() => setView('grid')} className={`block mt-4 text-sm mx-auto hover:underline ${theme.textMuted}`}>{t('return')}</button>
                            </div>
                            )}
                        </div>

                    /* GALLERY VIEW */
                    ) : view === 'gallery' ? (
                        <div className="max-w-7xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
                            <div className="text-center mb-12">
                                <h2 className={`text-3xl font-serif font-bold mb-2 ${theme.text}`}>{t('gallery')}</h2>
                                <p className={theme.textMuted}>A visual journey through the artifacts and monuments of the Ahom Kingdom.</p>
                            </div>
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                                {dbItems.filter(i => i.image).map(item => (
                                    <div key={item.id} onClick={() => { setActiveArticleId(item.id); setView('article'); }} className={`break-inside-avoid rounded-xl overflow-hidden shadow-md cursor-pointer group relative border ${theme.card}`}>
                                        <img src={item.image} alt={item.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                            <h3 className="text-white font-bold font-serif text-lg">{item.title}</h3>
                                            <p className="text-stone-300 text-sm">{item.category}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    /* RESEARCH / SPEECH / DISTRICT PAGES */
                    ) : view === 'about' || view === 'speech' || view === 'district' ? (
                        <InfoPage pageKey={view} icon={view === 'about' ? Info : view === 'speech' ? Building2 : FileText} />
                    
                    /* RESEARCH PAGE (SPECIFIC) */
                    ) : view === 'research' ? (
    <div className="max-w-7xl mx-auto p-6 md:p-12 animate-in fade-in duration-500">
        <h2 className={`text-3xl font-serif font-bold mb-8 ${theme.text}`}>{t('research')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* ACADEMIC PAPERS SECTION */}
            <div className={`p-6 rounded-xl border shadow-sm ${theme.card}`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${theme.text}`}><GraduationCap className="w-6 h-6 text-amber-600" /> Academic Papers</h3>
                <ul className="space-y-4">
                    {resources.filter(r => r.type === 'Academic Paper').map((paper) => (
                        <li key={paper.id} className={`flex justify-between items-center p-3 rounded border ${theme.divider} ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
                            <div className="min-w-0 flex-1 mr-4">
                                <div className={`font-bold text-sm truncate ${theme.text}`}>{paper.title}</div>
                                <div className={`text-xs ${theme.textMuted}`}>{paper.author}</div>
                                {paper.url && (
                                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                        <LinkIcon className="w-3 h-3"/> View Document
                                    </a>
                                )}
                            </div>
                            {/* Updated Download Link */}
                            {paper.url && (
                                <a 
                                    href={paper.url} 
                                    download 
                                    className="text-amber-600 hover:text-amber-700 p-2 transition-colors"
                                    title="Download PDF"
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* OFFICIAL REPORTS SECTION */}
            <div className={`p-6 rounded-xl border shadow-sm ${theme.card}`}>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${theme.text}`}><Building2 className="w-6 h-6 text-amber-600" /> Official Reports</h3>
                <ul className="space-y-4">
                    {resources.filter(r => r.type !== 'Academic Paper').map((paper) => (
                        <li key={paper.id} className={`flex justify-between items-center p-3 rounded border ${theme.divider} ${isDarkMode ? 'bg-stone-950' : 'bg-stone-50'}`}>
                            <div className="min-w-0 flex-1 mr-4">
                                <div className={`font-bold text-sm truncate ${theme.text}`}>{paper.title}</div>
                                <div className={`text-xs ${theme.textMuted}`}>{paper.author}</div>
                                {paper.url && (
                                    <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                        <LinkIcon className="w-3 h-3"/> View Document
                                    </a>
                                )}
                            </div>
                            {/* Updated Download Link */}
                            {paper.url && (
                                <a 
                                    href={paper.url} 
                                    download 
                                    className="text-amber-600 hover:text-amber-700 p-2 transition-colors"
                                    title="Download PDF"
                                >
                                    <Download className="w-5 h-5" />
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>


                    /* GRID VIEW (DEFAULT) */
                    ) : (
                        <div className="animate-in fade-in duration-500 pb-12">
                             {/* Only show Hero on 'all' view without search */}
                            {activeCategory === 'all' && !searchQuery && (
                                <div className="relative py-20 px-6 md:px-12 mb-8 overflow-hidden">
                                    <div className="absolute inset-0 z-0">
                                        <img src={HERO_BG} alt="Hero" className="w-full h-full object-cover" />
                                        <div className={`absolute inset-0 ${isDarkMode ? 'bg-black/70' : 'bg-black/50'}`} />
                                    </div>
                                    <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
                                        <div className="inline-flex items-center gap-2 text-amber-400 font-bold tracking-widest uppercase text-xs mb-4 border border-amber-400/50 px-3 py-1 rounded-full">{t('est')}</div>
                                        <h1 className={`text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight drop-shadow-lg`}>{t('heroTitle')} <span className="text-amber-400">{t('heroSubtitle')}</span></h1>
                                        <p className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8 text-stone-100 font-medium drop-shadow-md`}>{t('heroDesc')}</p>
                                        <div className="flex flex-wrap justify-center gap-4">
                                            <button onClick={() => { setView('timeline'); setActiveCategory('all'); }} className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold shadow-lg flex items-center gap-2"><Clock className="w-4 h-4" /> {t('viewTimeline')}</button>
                                            <button onClick={() => setView('quiz')} className="px-6 py-3 border border-white/50 hover:bg-white/10 text-white rounded font-bold flex items-center gap-2"><Brain className="w-4 h-4" /> {t('takeQuiz')}</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="max-w-7xl mx-auto px-6 md:px-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredData.map(item => (
                                    <div key={item.id} onClick={() => { setActiveArticleId(item.id); setView('article'); }} className={`group rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full border ${theme.card}`}>
                                        <div className={`h-48 overflow-hidden relative ${isDarkMode ? 'bg-stone-800' : 'bg-stone-200'}`}>
                                        {item.image ? <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className={`w-full h-full flex items-center justify-center ${theme.textMuted}`}><Landmark className="w-12 h-12 opacity-20" /></div>}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-stone-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">{item.category.toUpperCase()}</div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                        <div className="text-xs font-bold text-amber-600 mb-2 font-serif">{item.year} CE</div>
                                        <h2 className={`text-xl font-bold font-serif mb-3 leading-tight group-hover:text-amber-600 transition-colors ${theme.text}`}>{item.title}</h2>
                                        <p className={`text-sm line-clamp-3 mb-4 flex-1 leading-relaxed ${theme.textMuted}`}>{item.summary}</p>
                                        <div className={`pt-4 border-t flex items-center text-xs font-bold uppercase tracking-widest group-hover:text-amber-600 transition-colors ${theme.divider} ${theme.textMuted}`}>{t('readHistory')}<ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" /></div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                            
                            {filteredData.length === 0 && (
                                <div className="text-center py-20 opacity-50">
                                    <Search className="w-16 h-16 mx-auto mb-4 text-stone-300" />
                                    <p className="text-xl font-serif">No records found.</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
        
        {/* ADD ITEM MODAL */}
        {showAddModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className={`w-full max-w-4xl p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${theme.card} animate-in zoom-in-95 duration-200`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold font-serif">Add New Artifact</h3>
                        <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"><X className="w-6 h-6" /></button>
                    </div>
                    <form onSubmit={handleSaveItem} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1 text-stone-500">Title</label>
                                <input type="text" className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 ${theme.input}`} value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1 text-stone-500">Category</label>
                                <select className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 ${theme.input}`} value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}>
                                    {CATEGORIES.slice(1).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-xs font-bold uppercase mb-1 text-stone-500">Year (CE)</label>
                                <input type="number" className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 ${theme.input}`} value={newItem.year} onChange={e => setNewItem({...newItem, year: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1 text-stone-500">Main Image URL</label>
                                <input type="text" className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 ${theme.input}`} value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 text-stone-500">Short Summary</label>
                            <textarea className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 ${theme.input}`} rows="2" value={newItem.summary} onChange={e => setNewItem({...newItem, summary: e.target.value})}></textarea>
                        </div>
                        
                        <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
                            <h4 className="font-bold mb-4 flex items-center gap-2 text-stone-500 uppercase text-xs tracking-wider"><FileText className="w-4 h-4" /> Content Sections</h4>
                            {newItem.content.map((section, idx) => (
                                <div key={idx} className="p-4 border border-stone-200 dark:border-stone-700 rounded-xl mb-4 bg-stone-50 dark:bg-stone-800/50">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs font-bold text-stone-500">SECTION {idx + 1}</span>
                                        <button type="button" onClick={() => removeContentSection(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <input type="text" className={`w-full p-2 border rounded-lg mb-2 ${theme.input}`} placeholder="Section Header" value={section.header} onChange={e => updateContentSection(idx, 'header', e.target.value)} />
                                    <textarea className={`w-full p-2 border rounded-lg mb-2 ${theme.input}`} placeholder="Section Text Content" rows="3" value={section.text} onChange={e => updateContentSection(idx, 'text', e.target.value)}></textarea>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="text" className={`w-full p-2 border rounded-lg ${theme.input}`} placeholder="Section Image URL" value={section.image} onChange={e => updateContentSection(idx, 'image', e.target.value)} />
                                        <input type="text" className={`w-full p-2 border rounded-lg ${theme.input}`} placeholder="Image Caption" value={section.caption} onChange={e => updateContentSection(idx, 'caption', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addContentSection} className="text-amber-600 font-bold text-sm hover:underline flex items-center gap-1">+ Add Another Section</button>
                        </div>

                        <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
                            <h4 className="font-bold mb-4 flex items-center gap-2 text-stone-500 uppercase text-xs tracking-wider"><Info className="w-4 h-4" /> {t('infobox')}</h4>
                            {newItem.infobox.map((row, idx) => (
                                <div key={idx} className="flex gap-2 mb-2">
                                    <input type="text" className={`w-1/3 p-2 rounded border ${theme.input}`} placeholder="Label" value={row.label} onChange={e => updateInfoboxRow(idx, 'label', e.target.value)} />
                                    <input type="text" className={`flex-1 p-2 rounded border ${theme.input}`} placeholder="Value" value={row.value} onChange={e => updateInfoboxRow(idx, 'value', e.target.value)} />
                                    <button type="button" onClick={() => removeInfoboxRow(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button type="button" onClick={addInfoboxRow} className="text-sm text-amber-600 font-bold hover:underline">+ {t('addRow')}</button>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800 mt-4">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 border rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 shadow-lg">
                                {backendOnline ? 'Save to Database' : 'Save Locally (Demo)'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* RESOURCE UPLOAD MODAL */}
        {showResourceModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${theme.card} animate-in zoom-in-95 duration-200`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold font-serif">Add Resource</h3>
                        <button onClick={() => setShowResourceModal(false)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full"><X className="w-6 h-6" /></button>
                    </div>
                    <form onSubmit={handleSaveResource} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 text-stone-500">Title</label>
                            <input type="text" className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 ${theme.input}`} value={newResource.title} onChange={e => setNewResource({...newResource, title: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 text-stone-500">Author/Source</label>
                            <input type="text" className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 ${theme.input}`} value={newResource.author} onChange={e => setNewResource({...newResource, author: e.target.value})} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 text-stone-500">Type</label>
                            <select className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 ${theme.input}`} value={newResource.type} onChange={e => setNewResource({...newResource, type: e.target.value})}>
                                <option>Academic Paper</option>
                                <option>Official Report</option>
                                <option>Map/Atlas</option>
                                <option>Manuscript</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 text-stone-500">Document (Upload PDF)</label>
                            <input 
                                type="file" 
                                accept=".pdf"
                                className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 ${theme.input}`} 
                                onChange={handleFileUpload}
                            />
                            <p className="text-[10px] mt-1 text-stone-500">Limit: 500KB (Stored locally)</p>
                        </div>
                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-stone-300"></div>
                            <span className="flex-shrink mx-4 text-xs text-stone-400 font-bold uppercase">OR</span>
                            <div className="flex-grow border-t border-stone-300"></div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 text-stone-500">Document URL</label>
                            <input type="url" className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 ${theme.input}`} placeholder="https://..." value={newResource.url || ''} onChange={e => setNewResource({...newResource, url: e.target.value})} />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800 mt-4">
                            <button type="button" onClick={() => setShowResourceModal(false)} className="px-6 py-2 border rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 shadow-lg">
                                {backendOnline ? 'Add to Library' : 'Add (Demo)'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* CMS Editor Modal */}
        {editingCms && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className={`w-full max-w-3xl p-6 rounded-xl shadow-2xl border ${theme.card} flex flex-col h-[80vh]`}>
                    <h3 className={`text-xl font-bold mb-4 ${theme.text}`}>Edit {t(editingCms === 'about' ? 'aboutProject' : editingCms === 'speech' ? 'authSpeech' : 'districtInfo')}</h3>
                    <textarea className={`flex-1 w-full p-4 rounded border ${theme.input} font-mono text-sm resize-none`} value={tempCmsText} onChange={e => setTempCmsText(e.target.value)}></textarea>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setEditingCms(null)} className={`px-4 py-2 rounded text-sm font-medium ${theme.textMuted}`}>{t('cancel')}</button>
                        <button onClick={() => handleSaveCms(editingCms)} className="px-4 py-2 rounded text-sm font-medium bg-amber-600 text-white">{t('saveItem')}</button>
                    </div>
                </div>
            </div>
        )}

        {/* Compact Footer */}
            <footer className={`border-t mt-auto py-6 no-print notranslate ${isDarkMode ? 'bg-stone-950 border-stone-800' : 'bg-stone-100 border-stone-200'}`}>
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain rounded" />
                        <div>
                            <span className={`font-serif font-bold text-base ${theme.text}`}>{t('appTitle')}</span>
                            <p className={`text-xs ${theme.textMuted}`}>{t('footerRights')}</p>
                        </div>
                    </div>
                    
                    <div className={`text-xs text-center md:text-right ${theme.textMuted}`}>
                         <p className="mb-1">{t('footerDev')}</p>
                         <p className="flex justify-center md:justify-end gap-4 mt-2">
                             <span className="flex items-center gap-1 cursor-pointer hover:text-amber-600"><Mail className="w-3 h-3" /> {t('email')}</span>
                             <span className="flex items-center gap-1 cursor-pointer hover:text-amber-600"><Phone className="w-3 h-3" /> +91 3772 222222</span>
                         </p>
                    </div>

                    <div className="flex gap-4">
                        <Facebook className="w-4 h-4 hover:text-blue-600 cursor-pointer text-stone-400" />
                        <Twitter className="w-4 h-4 hover:text-sky-500 cursor-pointer text-stone-400" />
                        <Instagram className="w-4 h-4 hover:text-pink-600 cursor-pointer text-stone-400" />
                    </div>
                </div>
            </footer>
      </main>
    </div>
  );
};

export default App;