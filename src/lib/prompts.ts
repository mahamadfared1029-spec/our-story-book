import type { MilestoneType, MoodTag } from "@/lib/types/database";

export interface MemoryPrompt {
  id: string;
  title: string;
  category: "beginnings" | "milestones" | "travel" | "daily" | "deep";
  categoryLabel: string;
  reflectionQuestion: string;
  placeholder: string;
  isMilestone: boolean;
  milestoneType?: MilestoneType;
  suggestedMood?: MoodTag;
}

export const MEMORY_PROMPTS: MemoryPrompt[] = [
  // البدايات الجميلة
  {
    id: "first_meet",
    title: "أول لقاء جمع بيننا",
    category: "beginnings",
    categoryLabel: "البدايات الجميلة",
    reflectionQuestion: "أين كان المكان؟ وما أول فكرة خطرت ببالك حين رأيتني؟",
    placeholder: "كان اليوم يبدو عاديًا حتى تلك اللحظة التي التقت فيها أعيننا...",
    isMilestone: true,
    milestoneType: "first_meet",
    suggestedMood: "romantic",
  },
  {
    id: "first_coffee",
    title: "أول فنجان قهوة أو حديث طويل",
    category: "beginnings",
    categoryLabel: "البدايات الجميلة",
    reflectionQuestion: "عن ماذا تحدثنا؟ وكم من الوقت مضى دون أن نشعر؟",
    placeholder: "جلسنا في ذلك المكان الهادئ، وبدأنا نتبادل أطراف الحديث...",
    isMilestone: false,
    suggestedMood: "cozy",
  },
  {
    id: "first_photo",
    title: "أول صورة التقطناها معًا",
    category: "beginnings",
    categoryLabel: "البدايات الجميلة",
    reflectionQuestion: "من اقترح التقاط الصورة؟ وكيف كانت الابتسامة الخجولة؟",
    placeholder: "لم نكن معتادين على الوقوف بجوار بعضنا أمام الكاميرا بعد...",
    isMilestone: false,
    suggestedMood: "nostalgic",
  },
  {
    id: "the_moment_i_knew",
    title: "اللحظة التي تأكدت فيها من مشاعري",
    category: "deep",
    categoryLabel: "مشاعر عميقة",
    reflectionQuestion: "ما الموقف البسيط الذي جعل قلبي يطمئن تمامًا لك؟",
    placeholder: "لم يكن موقفًا دراميًا، بل كان تصرفًا لطيفًا أدركت معه أنني وجدت نصفي الآخر...",
    isMilestone: true,
    milestoneType: "special_moment",
    suggestedMood: "romantic",
  },

  // المحطات الكبرى
  {
    id: "proposal_day",
    title: "يوم طلب الزواج ووعد العمر",
    category: "milestones",
    categoryLabel: "المحطات الكبرى",
    reflectionQuestion: "كيف كانت دقات القلب والتخطيط السري لتلك اللحظة؟",
    placeholder: "كانت المشاعر تفيض فرحًا وارتباكًا جميلاً حين نطقت تلك الكلمات...",
    isMilestone: true,
    milestoneType: "proposal",
    suggestedMood: "special",
  },
  {
    id: "engagement_day",
    title: "يوم الخطوبة وخاتم البداية",
    category: "milestones",
    categoryLabel: "المحطات الكبرى",
    reflectionQuestion: "فرحة العائلتين واللحظات الأولى مع خاتم يجمعنا.",
    placeholder: "تزين ذلك اليوم بأصوات الفرح والتهاني، وارتدينا معًا أول رمز لعهدنا المشترك...",
    isMilestone: true,
    milestoneType: "engagement",
    suggestedMood: "joyful",
  },
  {
    id: "wedding_day",
    title: "ليلة العمر ويوم الزفاف",
    category: "milestones",
    categoryLabel: "المحطات الكبرى",
    reflectionQuestion: "النظرة الأولى بالأبيض، وأجمل رقصة جمعتنا بين أحبائنا.",
    placeholder: "حين رأيتك في ذلك اليوم، شعرت وكأن العالم كله توقف إعجابًا وفرحًا بنا...",
    isMilestone: true,
    milestoneType: "wedding",
    suggestedMood: "romantic",
  },
  {
    id: "first_home",
    title: "أول ليلة في بيتنا الصغير",
    category: "milestones",
    categoryLabel: "المحطات الكبرى",
    reflectionQuestion: "مفاتيح البيت وترتيب الزوايا الأولى لحياتنا المشتركة.",
    placeholder: "فتحنا الباب معًا ونحن ننظر للمكان الذي سيحتضن كل أيامنا القادمة...",
    isMilestone: true,
    milestoneType: "new_home",
    suggestedMood: "cozy",
  },

  // السفر والمغامرات
  {
    id: "first_trip",
    title: "أول رحلة سفر استكشفنا فيها العالم سوياً",
    category: "travel",
    categoryLabel: "السفر والمغامرات",
    reflectionQuestion: "أين كانت وجهتنا؟ وما الذي أضحكنا في المطار أو الطريق؟",
    placeholder: "حقائب السفر وتذاكر الطيران، وأجمل أيام قضيناها بعيدًا عن كل روتين...",
    isMilestone: true,
    milestoneType: "trip",
    suggestedMood: "joyful",
  },
  {
    id: "rainy_walk",
    title: "مسير تحت المطر أو في ليلة باردة",
    category: "daily",
    categoryLabel: "لحظات يومية دافئة",
    reflectionQuestion: "كيف تحولت برودة الطقس إلى أدفأ ذكرى في القلب؟",
    placeholder: "فجأة هطل المطر، ولم نكن نملك مظلة، فقررنا أن نضحك ونكمل المسير...",
    isMilestone: false,
    suggestedMood: "peaceful",
  },
  {
    id: "favorite_song",
    title: "أغنية أصبحت ملكًا لنا",
    category: "daily",
    categoryLabel: "لحظات يومية دافئة",
    reflectionQuestion: "متى استمعنا لها معًا لأول مرة؟ ولماذا تذكرنا ببعضنا دومًا؟",
    placeholder: "كلما عزفت هذه الألحان، تعود بي الذاكرة فورًا إلى تلك اللحظة...",
    isMilestone: false,
    suggestedMood: "nostalgic",
  },
  {
    id: "cooking_together",
    title: "أول وجبة طهوناها معًا",
    category: "daily",
    categoryLabel: "لحظات يومية دافئة",
    reflectionQuestion: "من كان الطاهي الرئيسي ومن أفسد الوصفة بضحك؟",
    placeholder: "كان المطبخ في حالة فوضى عارمة، لكن الطعم كان ألذ مما توقعنا...",
    isMilestone: false,
    suggestedMood: "funny",
  },
];

export function getPromptById(id: string): MemoryPrompt | undefined {
  return MEMORY_PROMPTS.find((p) => p.id === id);
}

export function getRandomPrompts(count = 3): MemoryPrompt[] {
  const shuffled = [...MEMORY_PROMPTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
