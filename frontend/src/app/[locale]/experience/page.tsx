import { getTranslations } from "next-intl/server";
import { Briefcase, Calendar, MapPin } from "lucide-react";

interface Experience {
  id: number;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
}

// Experience data
const experiences: Experience[] = [
  {
    id: 1,
    company: "Immo 1ère",
    position: "Server",
    location: "Montreal, QC",
    startDate: "2023-06",
    endDate: "2024-08",
    current: false,
    responsibilities: [
      "Provided exceptional customer service in a fast-paced restaurant environment",
      "Managed multiple tables efficiently while maintaining attention to detail",
      "Collaborated with kitchen staff to ensure timely and accurate order delivery",
      "Handled customer inquiries and resolved issues professionally",
    ],
  },
  {
    id: 2,
    company: "Champlain College",
    position: "Peer Tutor",
    location: "Saint-Lambert, QC",
    startDate: "2022-09",
    endDate: "2023-05",
    current: false,
    responsibilities: [
      "Tutored students in programming fundamentals and computer science concepts",
      "Assisted with Java, C#, and web development coursework",
      "Helped students debug code and understand complex algorithms",
      "Mentored peers in developing problem-solving skills",
    ],
  },
];

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("experience");

  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(locale, { year: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen py-16 bg-gray-50 dark:bg-[#0a0a0f]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16 fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Work Experience
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            My professional journey and work history
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-gray-200 dark:bg-gray-700"></div>

            {/* Experience items */}
            {experiences.map((exp, index) => (
              <div
                key={exp.id}
                className={`relative mb-12 ${
                  index % 2 === 0
                    ? "md:pr-8 md:text-right"
                    : "md:pl-8 md:ml-auto md:text-left"
                } md:w-1/2 fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-auto md:right-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-gray-50 dark:border-[#0a0a0f] md:transform md:translate-x-1/2"></div>
                {index % 2 !== 0 && (
                  <div className="hidden md:block absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-gray-50 dark:border-[#0a0a0f]"></div>
                )}

                {/* Content card */}
                <div className="ml-8 md:ml-0 p-6 bg-white dark:bg-[#1a1a2e] rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
                  {/* Company and position */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {exp.position}
                  </h3>
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3 md:justify-end">
                    <Briefcase className="w-4 h-4" />
                    <span className="font-semibold">{exp.company}</span>
                  </div>

                  {/* Date and location */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4 text-gray-600 dark:text-gray-400 text-sm md:justify-end">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(exp.startDate)} -{" "}
                        {exp.current ? "Present" : formatDate(exp.endDate)}
                      </span>
                    </div>
                    <span className="hidden md:inline">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{exp.location}</span>
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1.5">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
