
import React from "react";
import LanguageImage from "@/app/components/languages";
import Carousel from "./carousel";

function FrontendRow() {
  return (
    <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
      <div className="mb-4">
        <h4 className="text-xl font-bold text-center">Frontend</h4>
      </div>
      <Carousel>
        <LanguageImage title="React" image="react" />
        <LanguageImage title="Next.js" image="nextjs" />
        <LanguageImage title="JavaScript" image="js" />
        <LanguageImage title="TypeScript" image="ts" />
        <LanguageImage title="TailwindCss" image="tailwind" />
        <LanguageImage title="HTML" image="html" />
        <LanguageImage title="CSS" image="css" />
      </Carousel>
    </div>
  );
}

function BackendRow() {
  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      <div className="mb-4">
        <h4 className="text-xl font-bold text-center">Backend</h4>
      </div>
      <Carousel>
        <LanguageImage title="Python" image="py" />
        <LanguageImage title="Django" image="django" />
        <LanguageImage title="Sqlite" image="sqlite" />
        <LanguageImage title="Postgres" image="postgres" />
        <LanguageImage title="Bash" image="bash" />
        <LanguageImage title="Nginx" image="nginx" />
        <LanguageImage title="Git" image="git" />
      </Carousel>
    </div>
  );
}

function CloudRow() {
  return (
    <div className="p-4 bg-gray-200 dark:bg-gray-700 rounded-lg">
      <div className="mb-4">
        <h4 className="text-xl font-bold text-center">Cloud</h4>
      </div>
      <Carousel>
        <LanguageImage title="AWS" image="aws" />
        <LanguageImage title="Cloudflare" image="cloudflare" />
        <LanguageImage title="Linux" image="linux" />
        <LanguageImage title="Debian" image="debian" />
        <LanguageImage title="Ubuntu" image="ubuntu" />
      </Carousel>
    </div>
  );
}



export default function LanguageGrid() {
  return (
    <div className="w-full overflow-x-auto">
      <FrontendRow />
      <BackendRow />
      <CloudRow />
    </div>
  );
}
