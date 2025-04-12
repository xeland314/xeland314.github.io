export default function QRPaymentOptions() {
    return (
      <div className="flex flex-col items-center gap-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
            Apóyame en Buy Me a Coffee
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
            Escanea el siguiente código QR para apoyarme y contribuir a mis proyectos.
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
            También puedes usar Ko-fi para contribuir y ayudarme a seguir creando contenido.
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
  