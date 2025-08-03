"use client";

import ReCAPTCHA from "react-google-recaptcha";
import useEmailForm from "./useEmailForm";
import { useAstroTheme } from "../../hooks/useAstroThemes";

type Theme = "light" | "dark";

const ContactForm = () => {
  const { mounted, resolvedTheme } = useAstroTheme();

  const {
    content,
    setField,
    status,
    handleRecaptchaChange,
    handleRecaptchaExpired,
    errors,
    emailCount,
    sendEmail,
  } = useEmailForm();

  const buttonText = (() => {
    if (emailCount >= 2 || emailCount < 0) {
      return `Has alcanzado el límite diario de correos (${emailCount}/2)`;
    }
    return `Enviar (${emailCount}/2)`;
  })();

  return (
    <form
      id="contact-form"
      onSubmit={sendEmail}
      className="space-y-4 w-full max-w-lg bg-gray-200 dark:bg-gray-700 rounded-lg shadow-lg p-6"
    >
      <h3 className="w-full text-2xl font-bold text-center pb-4 mx-4 text-gray-800 dark:text-white">
        Contáctame
      </h3>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium pb-1 text-gray-700 dark:text-gray-300"
        >
          Correo electrónico:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={content.email || ""}
          onChange={(e) => setField("email", e.target.value)}
          required
          maxLength={128}
          minLength={1}
          autoComplete="email"
          className="w-full mt-1 block px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium pb-1 text-gray-700 dark:text-gray-300"
        >
          Nombre:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={content.name || ""}
          onChange={(e) => setField("name", e.target.value)}
          required
          maxLength={128}
          minLength={1}
          autoComplete="name"
          className="w-full mt-1 block px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600"
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium pb-1 text-gray-700 dark:text-gray-300"
        >
          Mensaje:
        </label>
        <textarea
          id="message"
          name="message"
          value={content.message || ""}
          onChange={(e) => setField("message", e.target.value)}
          required
          maxLength={2000}
          minLength={1}
          rows={10}
          autoComplete="off"
          className="w-full block px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600" // <--- Contraste mejorado
        />
        <div className="flex flex-row justify-end">
          <p className="text-sm pt-1">
            {content.message?.length || 0}/2000 caracteres
          </p>
        </div>
        {errors.message && (
          <p className="text-red-600 text-sm">{errors.message}</p>
        )}
      </div>

      {mounted && resolvedTheme && (
        <div className="w-full flex justify-center items-center my-4 mobile:scale-100 scale-65 transition-transform duration-300">
          <ReCAPTCHA
            key={resolvedTheme}
            sitekey={import.meta.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
            onChange={handleRecaptchaChange}
            onExpired={handleRecaptchaExpired}
            theme={resolvedTheme as Theme}
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full inline-flex justify-center mt-2 py-2 px-4 border border-transparent shadow-xs text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        disabled={emailCount >= 2}
      >
        {buttonText}
      </button>

      {status && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {status}
        </p>
      )}
    </form>
  );
};

export default ContactForm;
