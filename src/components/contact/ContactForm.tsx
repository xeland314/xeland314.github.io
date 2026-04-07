"use client";

import React, { lazy, Suspense } from 'react';

const ReCAPTCHA = lazy(() => import("react-google-recaptcha"));

import useEmailForm from "./useEmailForm";
import { useAstroTheme } from "../../hooks/useAstroThemes";

type Theme = "light" | "dark";

interface ContactFormProps {
  lang: "es" | "en";
}

const ContactForm: React.FC<ContactFormProps> = ({ lang }) => {
  const { mounted, resolvedTheme } = useAstroTheme();

  const texts = {
    es: {
      contact_me: "Contáctame",
      contact_me_subtitle: "Hablemos de tu próximo proyecto",
      email_label: "Correo electrónico:",
      name_label: "Nombre:",
      message_label: "Mensaje:",
      characters: "caracteres",
      recaptcha_aria: "reCAPTCHA response",
      submit_button: "Enviar",
      limit_reached: "Has alcanzado el límite diario de correos",
    },
    en: {
      contact_me: "Contact Me",
      contact_me_subtitle: "Let's talk about your next project",
      email_label: "Email:",
      name_label: "Name:",
      message_label: "Message:",
      characters: "characters",
      recaptcha_aria: "reCAPTCHA response",
      submit_button: "Send",
      limit_reached: "You have reached the daily email limit",
    },
  };

  const T = texts[lang];

  const {
    content,
    setField,
    status,
    handleRecaptchaChange,
    handleRecaptchaExpired,
    errors,
    emailCount,
    sendEmail,
  } = useEmailForm({ lang });

  const buttonText = (() => {
    if (emailCount >= 2 || emailCount < 0) {
      return `${T.limit_reached} (${emailCount}/2)`;
    }
    return `${T.submit_button} (${emailCount}/2)`;
  })();

  return (
    <form
      id="contact-form"
      onSubmit={sendEmail}
      className="space-y-5 w-full bg-gray-50 dark:bg-gray-900 rounded-3xl p-8"
    >
      <div className="mb-6">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-1">
          {T.contact_me}
        </h3>
        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 italic tracking-tighter">{T.contact_me_subtitle}</h4>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 ml-1"
          >
            {T.email_label}
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
            className="w-full block px-4 py-3 border bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
          />
          {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.email}</p>}
        </div>

        <div>
          <label
            htmlFor="name"
            className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 ml-1"
          >
            {T.name_label}
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
            className="w-full block px-4 py-3 border bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm"
          />
          {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.name}</p>}
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 ml-1"
          >
            {T.message_label}
          </label>
          <textarea
            id="message"
            name="message"
            value={content.message || ""}
            onChange={(e) => setField("message", e.target.value)}
            required
            maxLength={2000}
            minLength={1}
            rows={6}
            autoComplete="off"
            className="w-full block px-4 py-3 border bg-white dark:bg-gray-800/50 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all sm:text-sm resize-none"
          />
          <div className="flex flex-row justify-end">
            <p className="text-[10px] font-mono text-gray-400 pt-1 uppercase">
              {content.message?.length || 0} / 2000 {T.characters}
            </p>
          </div>
          {errors.message && (
            <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.message}</p>
          )}
        </div>
      </div>

      {mounted && resolvedTheme && (
        <div className="w-full flex justify-center items-center my-2 scale-90 mobile:scale-100 transition-transform duration-300">
          <Suspense fallback={<div className="h-[78px] w-[304px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />}>
            <ReCAPTCHA
              key={resolvedTheme}
              sitekey={import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              onExpired={handleRecaptchaExpired}
              theme={resolvedTheme as Theme}
              aria-label={T.recaptcha_aria}
            />
          </Suspense>
        </div>
      )}

      <button
        type="submit"
        className="w-full inline-flex justify-center py-4 px-4 border border-transparent text-xs font-black uppercase tracking-widest rounded-2xl text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] transition-all disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
        disabled={emailCount >= 2}
      >
        {buttonText}
      </button>

      {status && (
        <p className="mt-4 text-[10px] font-bold uppercase text-center text-blue-600 dark:text-blue-400 bg-blue-500/10 py-2 rounded-lg">
          {status}
        </p>
      )}
    </form>
  );
};

export default ContactForm;
