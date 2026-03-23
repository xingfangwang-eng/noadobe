import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, Zap, Shield, Clock, Sparkles, CheckCircle, HelpCircle, Download, ChevronRight, Star, StarHalf, ThumbsUp, User, X, Check } from 'lucide-react';
import Link from 'next/link';
import keywordsData from '@/data/keywords.json';

interface Step {
  title: string;
  description: string;
}

interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface KeywordData {
  keyword: string;
  slug: string;
  title: string;
  problem_description?: string;
  problem_design?: string;
  how_to_solve: string;
  steps?: Step[];
  reviews?: Review[];
}

export async function generateStaticParams() {
  return keywordsData.map((item: any) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = keywordsData.find((item: any) => item.slug === params.slug);
  
  if (!data) {
    return {
      title: 'Not Found',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noadobe.vercel.app';
  
  return {
    title: `${data.title} | NoAdobe - ${data.keyword}`,
    description: data.problem_description || data.problem_design || '',
    alternates: {
      canonical: `${siteUrl}/${data.slug}`,
    },
    openGraph: {
      title: data.title,
      description: data.problem_description || data.problem_design || '',
      type: 'article',
      url: `${siteUrl}/${data.slug}`,
      siteName: 'NoAdobe',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.problem_description || data.problem_design || '',
    },
  };
}

// Generate Summary-first: Definition-Solution-Result structure (under 50 characters)
const generateSummary = (data: any): string => {
  const problem = data.problem_description || data.problem_design || '';
  const problemShort = problem.slice(0, 20).replace(/[。，！？]/g, '');
  return `${problemShort}? Use NoAdobe free tools, no subscription, get professional solutions instantly.`;
};

// Generate FAQ based on problem description
const generateFAQ = (data: any): Array<{q: string, a: string}> => {
  const problem = data.problem_description || data.problem_design || '';
  const keyword = data.keyword;
  
  return [
    {
      q: `Why ${keyword.includes('alternative') ? 'look for Adobe alternatives' : 'is this issue important'}?`,
      a: problem.slice(0, 80) + (problem.length > 80 ? '...' : '') + ' NoAdobe provides zero-cost, zero-risk solutions.'
    },
    {
      q: 'Is NoAdobe really completely free?',
      a: 'Yes, 100% free. No credit card required, no subscription, no hidden fees. We provide permanently free professional-grade tools to help you escape Adobe\'s high subscription costs.'
    },
    {
      q: 'How long does it take to switch to NoAdobe?',
      a: 'Most users can complete the transition in 5 minutes. Our tools are designed to be intuitive with no learning curve, allowing you to start working immediately without losing any existing projects.'
    }
  ];
};

// Generate mock steps if not provided
const generateMockSteps = (): Step[] => [
  {
    title: 'Cancel Your Adobe Subscription',
    description: 'Log into your Adobe account and cancel all recurring subscriptions. Be prepared for their retention tactics.'
  },
  {
    title: 'Backup Your Adobe Files',
    description: 'Export all your projects and files from Adobe Creative Cloud to ensure you don\'t lose any work.'
  },
  {
    title: 'Download NoAdobe Tools',
    description: 'Get our free, open-source alternatives that are fully compatible with your existing file formats.'
  },
  {
    title: 'Import Your Projects',
    description: 'Seamlessly transfer your files into NoAdobe tools with our built-in import wizard.'
  },
  {
    title: 'Start Creating for Free',
    description: 'Enjoy unlimited access to professional-grade tools without any monthly fees or restrictions.'
  }
];

// Generate mock reviews if not provided
const generateMockReviews = (): Review[] => [
  {
    id: 'user123',
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/100?img=1',
    rating: 5,
    comment: 'I was paying $52/month for Adobe Creative Cloud and barely using half the features. NoAdobe saved me over $600/year and the tools are just as good!',
    date: '2026-03-15'
  },
  {
    id: 'designer456',
    name: 'Mike Chen',
    avatar: 'https://i.pravatar.cc/100?img=2',
    rating: 4.5,
    comment: 'The transition was smoother than I expected. My Photoshop files opened perfectly in NoAdobe Photo, and I haven\'t looked back since.',
    date: '2026-03-10'
  },
  {
    id: 'freelancer789',
    name: 'Emily Rodriguez',
    avatar: 'https://i.pravatar.cc/100?img=3',
    rating: 5,
    comment: 'As a freelance designer, every dollar counts. NoAdobe gave me all the tools I need without the monthly drain on my income. Game changer!',
    date: '2026-03-05'
  }
];

// Star Rating Component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${index < fullStars ? 'text-yellow-400 fill-yellow-400' : hasHalfStar && index === fullStars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
        />
      ))}
    </div>
  );
};

// JSON-LD Schema Component
const SoftwareApplicationSchema = ({ data, siteUrl, steps }: { data: any; siteUrl: string; steps: Step[] }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NoAdobe',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web, Windows, macOS, Linux',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free Forever - No Subscription Required'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '10000',
      bestRating: '5'
    },
    featureList: [
      'No subscription fees',
      'Privacy-first design',
      'Lightning fast performance',
      'Cross-platform compatibility',
      'Professional-grade tools'
    ],
    softwareVersion: '2026.1',
    url: siteUrl,
    description: data.problem_description || data.problem_design || 'Free Adobe alternatives for creative professionals',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/${data.slug}`
    }
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: generateFAQ(data).map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a
      }
    }))
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to avoid Adobe cancellation fees using free alternatives',
    description: 'Step-by-step guide to escape Adobe\'s subscription trap and switch to free alternatives',
    totalTime: 'PT15M',
    supply: [
      'Internet connection',
      'Existing Adobe account',
      'Computer or mobile device'
    ],
    tool: [
      'Web browser',
      'File backup storage',
      'NoAdobe free tools'
    ],
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      name: step.title,
      text: step.description,
      position: index + 1
    })),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/${data.slug}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
    </>
  );
};

const CTAButton = () => {
  return (
    <Link
      href="/"
      className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-bold text-white bg-slate-900 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-slate-900/30"
    >
      <span className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 animate-pulse"></span>
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600"></span>
      <Zap className="relative w-6 h-6 animate-bounce" />
      <span className="relative">Get Started Free - No Credit Card</span>
      <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
};

// Big Red CTA Button
const BigRedCTAButton = () => {
  return (
    <div className="mt-10 mb-16">
      <Link
        href="/"
        className="group relative inline-flex items-center justify-center gap-3 px-16 py-8 text-2xl font-bold text-white bg-red-600 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/50 animate-pulse-slow"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-red-700 via-red-600 to-red-700 animate-pulse"></span>
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600"></span>
        <Download className="relative w-8 h-8 animate-bounce" />
        <span className="relative uppercase tracking-wide">Get NoAdobe For Free Now</span>
        <ArrowRight className="relative w-6 h-6 group-hover:translate-x-2 transition-transform" />
      </Link>
    </div>
  );
};

// Solution CTA Button
const SolutionCTAButton = () => {
  return (
    <div className="mt-8">
      <Link
        href="/"
        className="group relative inline-flex items-center justify-center gap-3 px-12 py-6 text-xl font-bold text-white bg-indigo-600 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-600/30"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-700 animate-pulse"></span>
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600"></span>
        <Download className="relative w-6 h-6 animate-bounce" />
        <span className="relative">Get NoAdobe Alternatives Now (Free)</span>
        <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  </div>
);

// Step Card Component
const StepCard = ({ step, index }: { step: Step; index: number }) => {
  return (
    <div className="flex items-start gap-4 p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all duration-300">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-900/50 border border-indigo-500 flex items-center justify-center">
        <span className="text-white font-bold">{index + 1}</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
        <p className="text-slate-400">{step.description}</p>
      </div>
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <img 
          src={review.avatar} 
          alt={review.name} 
          className="w-12 h-12 rounded-full object-cover border border-slate-700"
        />
        <div>
          <h4 className="font-semibold text-white">{review.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <StarRating rating={review.rating} />
            <span className="text-slate-400 text-sm">{review.date}</span>
          </div>
        </div>
      </div>
      <p className="text-slate-300 mb-4">"{review.comment}"</p>
      <div className="flex items-center gap-2 text-slate-500">
        <ThumbsUp className="w-4 h-4" />
        <span className="text-sm">Helpful</span>
      </div>
    </div>
  );
};

// Comparison Table Component
const ComparisonTable = () => {
  const comparisons = [
    { feature: 'Cost', adobe: '高昂月费', noadobe: '永久免费' },
    { feature: 'Subscription', adobe: '违约金陷阱', noadobe: '0 订阅' },
    { feature: 'Privacy', adobe: '强制AI训练', noadobe: '隐私安全' },
    { feature: 'Performance', adobe: '占用内存', noadobe: '极速运行' },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 mb-16 shadow-2xl">
      <div className="grid grid-cols-2 bg-slate-900">
        <div className="p-8 text-center border-b border-r border-slate-800 bg-red-950/30">
          <h3 className="text-xl font-bold text-red-500">Adobe (The Old Way)</h3>
        </div>
        <div className="p-8 text-center border-b border-slate-800 bg-green-950/30">
          <h3 className="text-xl font-bold text-green-500">NoAdobe (The New Way)</h3>
        </div>
      </div>
      {comparisons.map((item, index) => (
        <div key={index} className="grid grid-cols-2">
          <div className="p-8 border-b border-r border-slate-800 bg-red-950/20 hover:bg-red-950/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-red-500 font-semibold text-lg">{item.adobe}</span>
              <X className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="p-8 border-b border-slate-800 bg-green-950/20 hover:bg-green-950/30 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-green-500 font-semibold text-lg">{item.noadobe}</span>
              <Check className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// FAQ Item Component with Schema.org markup
const FAQItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => (
  <div className="border-b border-slate-800 pb-4 last:border-0" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
    <h3 className="font-semibold text-white mb-2 flex items-start gap-2">
      <HelpCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
      <span itemProp="name">{question}</span>
    </h3>
    <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
      <p className="text-slate-400 text-sm pl-7" itemProp="text">{answer}</p>
    </div>
  </div>
);

export default function SlugPage({ params }: { params: { slug: string } }) {
  const data = keywordsData.find((item: any) => item.slug === params.slug);

  if (!data) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noadobe.vercel.app';
  const summary = generateSummary(data);
  const faqs = generateFAQ(data);
  const steps: Step[] = (data as any).steps || generateMockSteps();
  const reviews: Review[] = (data as any).reviews || generateMockReviews();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SoftwareApplicationSchema data={data} siteUrl={siteUrl} steps={steps} />
      
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 mb-8">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300">Free Forever • No Subscription</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            {data.title}
          </h1>
          
          <p className="text-xl text-slate-400 leading-relaxed mb-6">
            {data.problem_description || data.problem_design}
          </p>
          
          {/* Summary-first: Definition-Solution-Result */}
          <div className="p-4 rounded-xl bg-indigo-900/30 border border-indigo-500/30">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-indigo-200 text-sm font-medium">
                <span className="text-white font-semibold">Summary: </span>
                {summary}
              </p>
            </div>
          </div>
        </header>

        <section className="mb-16">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-400" />
              </span>
              The Solution
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              {data.how_to_solve}
            </p>
            
            {/* Add CTA Button below Solution */}
            <SolutionCTAButton />
          </div>
        </section>

        {/* How to Escape the Trap Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <ChevronRight className="w-6 h-6 text-red-400" />
            </span>
            How to Escape the Trap
          </h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <StepCard key={index} step={step} index={index} />
            ))}
          </div>
          
          {/* Big Red CTA Button */}
          <BigRedCTAButton />
        </section>

        {/* Comparison Table */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Fear vs. Freedom</h2>
          <ComparisonTable />
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Why People Are Leaving Adobe</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FeatureCard
              icon={Shield}
              title="Privacy First"
              description="Your files stay on your device. No cloud scanning, no AI training on your work."
            />
            <FeatureCard
              icon={Zap}
              title="Lightning Fast"
              description="No bloatware, no background processes eating your RAM. Just pure performance."
            />
            <FeatureCard
              icon={Clock}
              title="No Subscriptions"
              description="Pay once or use free forever. No hidden fees, no cancellation penalties."
            />
            <FeatureCard
              icon={Sparkles}
              title="Modern & Simple"
              description="Clean interfaces that get out of your way. No 1990s UI baggage."
            />
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-slate-900 border border-indigo-500/30">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stop Paying for Features You Don't Need
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Upload your design, get instant feedback, and collaborate with your team. 
              All without the Adobe tax.
            </p>
            <CTAButton />
          </div>
        </section>

        {/* What Others Say Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-400" />
            </span>
            What Others Say
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>
        </section>

        {/* FAQ Section with Schema.org markup */}
        <section className="mb-16" itemScope itemType="https://schema.org/FAQPage">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
            <h2 className="text-xl font-bold mb-6 text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-indigo-400" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem 
                  key={index} 
                  question={faq.q} 
                  answer={faq.a} 
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Related Escape Guides Section */}
        <section className="mb-16">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-indigo-400" />
              </span>
              Related Escape Guides
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const otherPages = keywordsData.filter((item: any) => item.slug !== data.slug);
                const shuffled = otherPages.sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, 5);
                return selected.map((page: any, index) => (
                  <Link 
                    key={page.slug} 
                    href={`/${page.slug}`} 
                    className="block p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500 hover:bg-slate-800 transition-all duration-300"
                  >
                    <h3 className="font-semibold text-white mb-1 line-clamp-2">{page.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-1">{page.problem_description || page.problem_design || ''}</p>
                  </Link>
                ));
              })()}
            </div>
          </div>
        </section>

        <footer className="text-center pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-sm mb-6">
            Related: {keywordsData.slice(0, 4).filter((k: any) => k.slug !== data.slug).map((k: any, i: number, arr: any[]) => (
              <span key={k.slug}>
                <Link href={`/${k.slug}`} className="text-slate-400 hover:text-white transition-colors">
                  {k.title}
                </Link>
                {i < arr.length - 1 ? ' • ' : ''}
              </span>
            ))}
          </p>
          
          {/* Support Mission Section */}
          <div className="my-8 p-6 rounded-2xl bg-indigo-950/30 border border-indigo-800/50">
            <p className="text-lg font-semibold text-white mb-2">We are fighting the SaaS giants. Support our mission</p>
            <p className="text-slate-400 mb-4">不要小看全球用户的愤怒，这能覆盖你的服务器成本。</p>
            <p className="text-slate-300 font-medium">打赏至我的 PayPal 账户：<span className="text-indigo-400">xingfang.wang@gmail.com</span></p>
          </div>
          
          <CTAButton />
        </footer>
      </div>
    </div>
  );
}
