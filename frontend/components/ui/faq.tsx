import { Badge } from "@/components/ui/badge";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Faq5Props {
  badge?: string;
  heading?: string;
  description?: string;
  faqs?: FaqItem[];
}

const defaultFaqs: FaqItem[] = [
  {
    question: "Apa itu Abroadly?",
    answer:
      "Abroadly adalah platform yang membantu kamu menemukan universitas terbaik di luar negeri, memberikan rekomendasi yang dipersonalisasi, dan menyediakan AI Assistant untuk konsultasi.",
  },
  {
    question: "Bagaimana cara kerja rekomendasi universitas?",
    answer:
      "Kami menggunakan algoritma cerdas untuk mencocokkan minat, bakat, dan kemampuanmu dengan universitas yang paling sesuai.",
  },
  {
    question: "Apakah Abroadly menyediakan bantuan beasiswa?",
    answer:
      "Ya, kami memberikan informasi tentang berbagai beasiswa yang tersedia di universitas pilihanmu.",
  },
  {
    question: "Bagaimana cara memantau aplikasi saya?",
    answer:
      "Gunakan fitur Activity Tracker kami untuk memantau status aplikasi kamu secara real-time.",
  },
];

export const Faq5 = ({
  heading = "FAQ",
  description = "Find out all the essential details about our platform and how it can serve your needs.",
  faqs = defaultFaqs,
}: Faq5Props) => {
  return (
    <section className="pb-16 pt-10">
      <div className="container">
        <div className="text-center">
          <h1 className="mt-4 text-4xl font-semibold">{heading}</h1>
          <p className="px-5 mt-6 font-medium text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="mx-auto mt-14 px-10 md:px-20">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-8 flex gap-4">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-secondary font-mono text-xs text-primary">
                {index + 1}
              </span>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{faq.question}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
