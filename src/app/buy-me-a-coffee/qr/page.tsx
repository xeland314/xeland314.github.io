import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apóyame en Buy Me a Coffee y Ko-fi - Christopher Villamarín Projects",
  description:
    "Contribuye a los proyectos de Christopher Villamarín a través de Buy Me a Coffee o Ko-fi. Escanea los códigos QR para apoyar y colaborar en la creación de contenido.",
  keywords: [
    "Buy Me a Coffee",
    "Ko-fi",
    "apoyo",
    "proyectos",
    "contribuir",
    "Christopher Villamarín",
    "xeland314",
    "Ecuador",
    "contenido",
    "QR Payment",
  ],
  authors: [
    { name: "Christopher Alexander Villamarín Pila" },
    { name: "xeland314" },
  ],
  creator: "xeland314",
  openGraph: {
    title:
      "Apóyame en Buy Me a Coffee y Ko-fi - Proyecto de Christopher Villamarín",
    description:
      "Utiliza los códigos QR de Buy Me a Coffee y Ko-fi para apoyar los proyectos de Christopher Villamarín y colaborar en la creación de contenido innovador.",
    url: "https://xeland314.github.io/projects/es/qr-payment-options/",
    type: "website",
    images: [
      {
        url: "/images/bmc_qr.png",
        width: 1200,
        height: 630,
        alt: "Código QR para Buy Me a Coffee",
      },
      {
        url: "/images/qrcode.png",
        width: 1200,
        height: 630,
        alt: "Código QR para Ko-fi",
      },
    ],
  },
  robots: "index, follow",
};

export default function QRPaymentOptions() {
  return (
    <div className="flex flex-col items-center gap-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h1 className="text-xl text-left self-start font-semibold text-gray-700 dark:text-white mb-2">
        Escanea los códigos QR de a continuación:
      </h1>
      <div className="flex flex-col items-center text-center">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
          Apóyame en Buy Me a Coffee
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
          Escanea el siguiente código QR para apoyarme y contribuir a mis
          proyectos.
        </p>
        <img
          src="/images/bmc_qr.png"
          alt="Buy Me a Coffee QR Code"
          className="w-56 h-56 object-contain p-5 bg-white"
        />
      </div>
      <div className="flex flex-col items-center text-center">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
          Apóyame en Ko-fi
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
          También puedes usar Ko-fi para contribuir y ayudarme a seguir creando
          contenido.
        </p>
        <img
          src="/images/qrcode.png"
          alt="Ko-fi QR Code"
          className="w-52 h-52 object-contain"
        />
      </div>
    </div>
  );
}
