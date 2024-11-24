"use client";

import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const ContactForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; message?: string }>(
    {}
  );

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  const validateForm = () => {
    const newErrors: { email?: string; message?: string } = {};
    if (!validateEmail(email)) {
      newErrors.email = "Por favor, ingresa un correo electrónico válido.";
    }
    if (message.trim() === "") {
      newErrors.message = "El mensaje no puede estar vacío.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaToken) {
      setStatus("Por favor, completa el reCAPTCHA.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    const res = await fetch("https://formspree.io/f/mzzbvwpw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        content: message,
        "g-recaptcha-response": recaptchaToken,
      }),
    });

    if (res.status === 200) {
      setStatus("Mensaje enviado correctamente!");
      setEmail("");
      setMessage("");
      setRecaptchaToken(null);
    } else {
      setStatus("Error al enviar el mensaje. Inténtalo de nuevo.");
    }
  };

  return (
    <form
      id="contact-form"
      onSubmit={sendEmail}
      className="flex flex-col max-w-96 mb-16 items-center"
    >
      <h3 className="text-2xl font-bold mb-4">Contáctame</h3>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium pb-1">
          Correo electrónico:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="min-w-52 w-80 mt-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}{" "}
      </div>
      <div className="mb-4">
        <label htmlFor="message" className="block text-sm font-medium pb-1">
          Mensaje:
        </label>
        <textarea
          id="message"
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={2000}
          minLength={1}
          rows={10}
          className="min-w-52 w-80 block px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <div className="flex flex-row justify-end">
          <p className="text-sm pt-1">{message.length}/2000 caracteres</p>
        </div>
        {errors.message && (
          <p className="text-red-600 text-sm">{errors.message}</p>
        )}
      </div>
      <ReCAPTCHA
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
        onChange={handleRecaptchaChange}
      />
      <button
        type="submit"
        className="min-w-52 w-80 inline-flex justify-center mt-2 py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Enviar
      </button>
      {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
    </form>
  );
};

export default ContactForm;
