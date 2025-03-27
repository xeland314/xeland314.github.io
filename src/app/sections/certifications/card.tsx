import { Badge } from "@/app/components";
import { OpenLink, Calendar } from "@/app/icons";
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
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-2">
      <div className="flex items-center mb-2">
        <img
          src={logo}
          alt={`${issuer} logo`}
          className="bg-white w-12 h-12 mr-4 self-start"
        />
        <div>
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{issuer}</p>
        </div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        <div className="flex items-center gap-2">
          <Calendar />
          <span>Expedición: {issueDate}</span>
        </div>
        <p>ID: {credentialId}</p>
      </div>
      <a
        href={credentialUrl}
        className="text-blue-500 hover:underline text-sm mb-4 flex items-center gap-2"
      >
        <OpenLink />
        Mostrar credencial
      </a>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <Badge index={index} text={skill} />
        ))}
      </div>
    </div>
  );
};

export default CertificationCard;
