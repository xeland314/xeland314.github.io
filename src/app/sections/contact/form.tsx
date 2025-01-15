"use client";

import React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import useEmailForm from "./useEmailForm";

const ContactForm = () => {
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

  return (
    <form
      id="contact-form"
      onSubmit={sendEmail}
      className="flex flex-col max-w-96 mb-16 items-center"
    >
      <div className="mb-4 scrolldown-animation-2">
        <label htmlFor="email" className="block text-sm font-medium pb-1">
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
          className="min-w-52 w-80 mt-1 block px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
      </div>
      <div className="mb-4 scrolldown-animation-2">
        <label htmlFor="name" className="block text-sm font-medium pb-1">
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
          className="min-w-52 w-80 mt-1 block px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
      </div>
      <div className="mb-4 scrolldown-animation-2">
        <label htmlFor="message" className="block text-sm font-medium pb-1">
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
          className="min-w-52 w-80 block px-3 py-2 border bg-white text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
      <ReCAPTCHA
        sitekey={
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
          "6LeeTIgqAAAAAJ9bsIrpSDTRNYJtx_GKfsz2z9q0"
        }
        onChange={handleRecaptchaChange}
        onExpired={handleRecaptchaExpired}
      />
      <button
        type="submit"
        className="min-w-52 w-80 inline-flex justify-center mt-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        disabled={emailCount >= 2}
      >
        {emailCount >= 2 || emailCount < 0
          ? "Has alcanzado el límite diario de correos "
          : "Enviar "}
        ({emailCount}/2)
      </button>
      {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
    </form>
  );
};

export default ContactForm;
