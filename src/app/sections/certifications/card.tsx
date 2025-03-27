import { Badge } from "@/app/components";
import { Calendar, Building2 } from "lucide-react";
type Certification = {
  logo: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
  skills: string[];
};

const CertificationCard = ({
  logo,
  title,
  issuer,
  issueDate,
  credentialId,
  credentialUrl,
  skills,
}: Certification) => {
  return (
    <div
      id={`${credentialId}`}
      className="min-h-52 flex flex-col justify-between bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 mb-2"
    >
      <div className="flex items-center">
        <img
          src={logo}
          alt={`${issuer} logo`}
          className="bg-white w-12 h-12 mr-4 self-start"
        />
        <div>
          <a
            href={credentialUrl}
            className="text-blue-500 hover:underline text-sm mb-4 flex items-center gap-2"
            title="Ver certificado"
            target="_blank"
          >
            <h3 className="text-lg font-bold">{title}</h3>
          </a>
        </div>
      </div>
      <div className="flex flex-col justify-start text-sm text-gray-600 dark:text-gray-400 mb-2">
        <div className="flex items-center gap-2">
          <Building2 />
          <p className="text-sm text-gray-600 dark:text-gray-400">{issuer}</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar />
          <span>Expedición: {issueDate}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 ">
        {skills.map((skill, index) => (
          <Badge index={index} text={skill} />
        ))}
      </div>
    </div>
  );
};

export default CertificationCard;
