export type CommentItem = {
  id: number;
  author: string;
  time: string;
  content: string;
  likes: string;
  dislikes: string;
};

export type CommunityItem = {
  slug: string;
  name: string;
  description: string;
  members: string;
  isJoined: boolean;
};

export type PostItem = {
  id: number;
  communitySlug: string;
  communityName: string;
  author: string;
  title: string;
  body: string;
  votes: string;
  downvotes: string;
  commentsCount: number;
  time: string;

  readTime: string;
  comments: CommentItem[];
};

export const communities: CommunityItem[] = [
  {
    slug: "startup",
    name: "انجمن استارتاپ",
    description: "بحث های واقعی درباره ساخت محصول، رشد و جذب کاربر",
    members: "۱۲.۴هزار عضو",
    isJoined: true,
  },
  {
    slug: "side-project",
    name: "انجمن پروژه جانبی",
    description: "اشتراک تجربه ساخت پروژه های کوچک و درآمدزا",
    members: "۸.۱هزار عضو",
    isJoined: false,
  },
  {
    slug: "web-dev",
    name: "انجمن توسعه وب",
    description: "Frontend، Backend، معماری و تجربه توسعه دهنده",
    members: "۱۵.۷هزار عضو",
    isJoined: true,
  },
  {
    slug: "design-review",
    name: "انجمن نقد طراحی",
    description: "دریافت بازخورد حرفه ای روی رابط کاربری و تجربه کاربر",
    members: "۶.۳هزار عضو",
    isJoined: false,
  },
  {
    slug: "programming",
    name: "انجمن برنامه نویسی",
    description: "گفت وگو درباره یادگیری، ابزارها و مسیر شغلی برنامه نویسی",
    members: "۲۰.۲هزار عضو",
    isJoined: true,
  },
];

export const feedItems: PostItem[] = [
  {
    id: 1,
    communitySlug: "startup",
    communityName: "انجمن استارتاپ",
    author: "u/productpilot",
    title: "بتای خصوصی را در ۲ هفته منتشر کردیم؛ این هم مسیر ورود کاربر.",
    body: "با کاهش مراحل شروع از ۶ به ۳ صفحه، کاربران اولیه ۳۲٪ سریع تر ثبت نام را کامل کردند.",
    votes: "۱.۳هزار",
    downvotes: "۴۳",
    commentsCount: 214,
    time: "۴ ساعت",

    readTime: "۵ دقیقه مطالعه",
    comments: [
      {
        id: 101,
        author: "u/mahdi_pm",
        time: "۳س",
        content: "جالب بود. کدام مرحله بیشترین ریزش را کم کرد؟",
        likes: "۳۲",
        dislikes: "۳",
      },
      {
        id: 102,
        author: "u/sara_ui",
        time: "۲س",
        content: "اگر اسکرین های قبل و بعد را هم بگذارید عالی می شود.",
        likes: "۱۸",
        dislikes: "۱",
      },
    ],
  },
  {
    id: 2,
    communitySlug: "web-dev",
    communityName: "انجمن توسعه وب",
    author: "u/stacksparrow",
    title: "قبل از معرفی MVP در Product Hunt، چک لیست شما چیست؟",
    body: "آنالیتیکس، احراز هویت و پرداخت آماده است. شما قبل از روز لانچ چه بررسی های UX انجام می دهید؟",
    votes: "۸۹۲",
    downvotes: "۲۱",
    commentsCount: 146,
    time: "۷ ساعت",

    readTime: "۳ دقیقه مطالعه",
    comments: [
      {
        id: 201,
        author: "u/hamid_launch",
        time: "۶س",
        content: "حتما روی موبایل و اینترنت ضعیف تست نهایی انجام بده.",
        likes: "۵۴",
        dislikes: "۵",
      },
      {
        id: 202,
        author: "u/niloofar_data",
        time: "۵س",
        content: "ایونت های قیف ثبت نام را دوباره چک کن؛ خیلی حیاتی هستند.",
        likes: "۲۷",
        dislikes: "۴",
      },
    ],
  },
  {
    id: 3,
    communitySlug: "design-review",
    communityName: "انجمن نقد طراحی",
    author: "u/uxnomad",
    title: "درخواست بازخورد: سلسله مراتب کارت ها برای موبایل واضح است؟",
    body: "در حال تست یک لیست فشرده تر هستم تا بدون شلوغی بصری، اطلاعات بیشتری در یک نگاه دیده شود.",
    votes: "۶۴۲",
    downvotes: "۱۸",
    commentsCount: 89,
    time: "۱۱ ساعت",

    readTime: "۴ دقیقه مطالعه",
    comments: [
      {
        id: 301,
        author: "u/mina_designer",
        time: "۹س",
        content: "تیتر و متادیتا کمی به هم نزدیکند؛ فاصله عمودی را بیشتر کن.",
        likes: "۲۱",
        dislikes: "۲",
      },
      {
        id: 302,
        author: "u/ali_front",
        time: "۸س",
        content: "برای موبایل شاید دکمه ها به شکل آیکن بهتر باشند.",
        likes: "۱۶",
        dislikes: "۰",
      },
    ],
  },
];

export const trending = [
  {
    label: "چهارشنبه های نمایش محصول",
    posts: "۱,۸۴۲ پست امروز",
  },
  {
    label: "تاپیک نقد تند MVP",
    posts: "۹۸۷ پست امروز",
  },
  {
    label: "داستان ۱۰۰ کاربر اول",
    posts: "۷۳۶ پست امروز",
  },
];

export function getCommunityBySlug(slug: string) {
  return communities.find((community) => community.slug === slug);
}

export function getPostsByCommunity(slug: string) {
  return feedItems.filter((post) => post.communitySlug === slug);
}
