import React from "react";

interface AuthorHeaderProps {
  name: string;
  date: string;
  dateTime: string;
}

const AuthorHeader: React.FC<AuthorHeaderProps> = ({ name, date, dateTime }) => {
  return (
    <header className="mt-6 text-sm text-gray-500 dark:text-gray-400">
      <time dateTime={dateTime} className="block">
        Publicado el: <strong>{date}</strong>
      </time>
      <address className="not-italic">
        Autor: <strong>{name}</strong>
      </address>
    </header>
  );
};

export default AuthorHeader;
