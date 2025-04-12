import { PaymentButtons } from "./buymeacookie";
import SocialNetworks from "./socialNetworks";

export default function Footer() {
  return (
    <footer className="py-8 px-8 bg-gray-900 text-white">
      <PaymentButtons />
      <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between md:items-center mt-6">
        <p
          className="text-center text-sm text-gray-400 md:text-left"
          aria-label="Derechos reservados"
        >
          © {new Date().getFullYear()} xeland314. All rights reserved.
        </p>
        <SocialNetworks />
      </div>
    </footer>
  );
}
