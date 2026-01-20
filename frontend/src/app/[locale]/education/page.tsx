import { getTranslations } from "next-intl/server";
import { GraduationCap, Calendar, MapPin, Award } from "lucide-react";

interface Education {
  id: number;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  coursework: string[];
  achievements: string[];
}

// Education data
const education: Education[] = [
  {
    id: 1,
    institution: "Champlain College",
    degree: "DEC (Diploma of College Studies)",
    field: "Computer Science",
    location: "Saint-Lambert, QC",
    startDate: "2021-08",
    endDate: "2024-05",
    current: false,
    coursework: [
      "Object-Oriented Programming (Java, C#)",
      "Web Development (HTML, CSS, JavaScript, React)",
      "Database Management (SQL Server, Azure SQL)",
      "Data Structures and Algorithms",
      "Software Engineering Principles",
      "Mobile Development (Kotlin)",
    ],
    achievements: [
      "Dean's List - Multiple Semesters",
      "Peer Tutor for Computer Science",
      "Completed multiple full-stack projects",
    ],
  },
];

export default async function EducationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("education");

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
            Education
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            My academic background and qualifications
          </p>
        </div>

        {/* Education items */}
        <div className="max-w-4xl mx-auto space-y-8">
          {education.map((edu, index) => (
            <div
              key={edu.id}
              className="fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-8 bg-white dark:bg-[#1a1a2e] rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                    <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {edu.institution}
                    </h2>
                    <p className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-3">
                      {edu.degree} in {edu.field}
                    </p>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(edu.startDate)} -{" "}
                          {edu.current ? "Present" : formatDate(edu.endDate)}
                        </span>
                      </div>
                      <span className="hidden md:inline">•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{edu.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                {edu.achievements.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Achievements
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {edu.achievements.map((achievement, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                        >
                          <span className="text-blue-500 mt-1.5">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Relevant Coursework */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Relevant Coursework
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {edu.coursework.map((course, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-blue-500 mt-1.5">•</span>
                        <span>{course}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
