import React from "react";
import LanguageImage from "@/app/components/languages";

function LanguageCategory({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="scrolldown-animation-2 w-full px-4 py-6 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md">
      <div className="mb-2">
        <h4 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          {title}
        </h4>
      </div>
      <div className="w-full flex flex-wrap justify-evenly gap-4">
        {children}
      </div>
    </div>
  );
}

export default function LanguageGrid() {
  return (
    <div className="w-full justify-between space-y-4">
      <LanguageCategory title="Frontend">
        <LanguageImage title="React" image="react" />
        <LanguageImage title="Next.js" image="nextjs" />
        <LanguageImage title="JavaScript" image="js" />
        <LanguageImage title="TypeScript" image="ts" />
        <LanguageImage title="TailwindCss" image="tailwind" />
        <LanguageImage title="HTML" image="html" />
        <LanguageImage title="CSS" image="css" />
      </LanguageCategory>

      <LanguageCategory title="Backend">
        <LanguageImage title="Java" image="java" />
        <LanguageImage title="Python" image="py" />
        <LanguageImage title="Django" image="django" />
        <LanguageImage title="Sqlite" image="sqlite" />
        <LanguageImage title="Postgres" image="postgres" />
        <LanguageImage title="Bash" image="bash" />
        <LanguageImage title="Nginx" image="nginx" />
        <LanguageImage title="Git" image="git" />
      </LanguageCategory>

      <LanguageCategory title="Cloud">
        <LanguageImage title="AWS" image="aws" />
        <LanguageImage title="Cloudflare" image="cloudflare" />
        <LanguageImage title="Linux" image="linux" />
      </LanguageCategory>
    </div>
  );
}
