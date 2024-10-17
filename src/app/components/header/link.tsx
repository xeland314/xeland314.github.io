interface LinkProps {
  href: string;
  className?: string;
  onClick?: () => void;
}

export default function HeaderLink({
  href,
  className,
  onClick,
  children,
}: LinkProps & { children: React.ReactNode }) {

  return (
    <a href={href} onClick={onClick} className={className}>
      <li
        className={`max-sm:w-full sm:basis-1/8 text-center block p-2 sm:py-0 transition duration-300 ease-in-out hover:bg-gray-600`}
      >
        {children}
      </li>
    </a>
  );
}
