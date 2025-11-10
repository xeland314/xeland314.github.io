"use client";

import { useState, useEffect, useCallback } from "react";

type EmailType = {
  email: string;
  message: string;
  name: string;
  "g-recaptcha-response": string | null;
};
type EmailWithoutCaptcha = Omit<EmailType, "g-recaptcha-response">;
type EmailErrors = Partial<EmailWithoutCaptcha>;
type EmailContent = Partial<EmailType>;

const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

interface UseEmailFormProps {
  lang: "es" | "en";
}

const useEmailForm = ({ lang }: UseEmailFormProps) => {
  const [content, setContent] = useState<EmailContent>({});
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<EmailErrors>({});
  const [emailCount, setEmailCount] = useState(0);

  const texts = {
    es: {
      invalid_email: "Por favor, ingresa un correo electrónico válido.",
      empty_message: "El mensaje no puede estar vacío.",
      recaptcha_missing: "Por favor, completa el reCAPTCHA.",
      limit_exceeded: "Has alcanzado el límite de correos enviados por hoy.",
      success: "¡Mensaje enviado correctamente!",
      error: "Error al enviar el mensaje. Inténtalo de nuevo.",
    },
    en: {
      invalid_email: "Please enter a valid email address.",
      empty_message: "The message cannot be empty.",
      recaptcha_missing: "Please complete the reCAPTCHA.",
      limit_exceeded: "You have reached the daily email limit.",
      success: "Message sent successfully!",
      error: "Error sending message. Please try again.",
    },
  };

  const T = texts[lang];

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const savedDate = localStorage.getItem("emailDate");
    const savedCount = localStorage.getItem("emailCount");

    if (savedDate === today && savedCount) {
      setEmailCount(parseInt(savedCount, 10));
    } else {
      localStorage.setItem("emailDate", today);
      localStorage.setItem("emailCount", "0");
    }
  }, []);

  const handleRecaptchaChange = useCallback((token: string | null) => {
    setContent((prevContent) => ({
      ...prevContent,
      "g-recaptcha-response": token,
    }));
  }, []);

  const handleRecaptchaExpired = useCallback(() => {
    setContent((prevContent) => ({
      ...prevContent,
      "g-recaptcha-response": null,
    }));
  }, []);

  const setField = useCallback((field: keyof EmailContent, value: string) => {
    setContent((prevContent) => ({
      ...prevContent,
      [field]: value,
    }));
  }, []);

  const validateForm = () => {
    const newErrors: EmailErrors = {};
    if (content.email && !validateEmail(content.email)) {
      newErrors.email = T.invalid_email;
    }
    if (content.message && content.message.trim() === "") {
      newErrors.message = T.empty_message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content["g-recaptcha-response"]) {
      setStatus(T.recaptcha_missing);
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (emailCount >= 2) {
      setStatus(T.limit_exceeded);
      return;
    }

    const res = await fetch("https://formspree.io/f/mzzbvwpw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: content.email,
        content: content.message,
        name: content.name,
        "g-recaptcha-response": content["g-recaptcha-response"],
      }),
    });

    if (res.status === 200) {
      setStatus(T.success);
      setContent({
        email: "",
        message: "",
        name: "",
        "g-recaptcha-response": "",
      });
      setEmailCount((prevCount) => {
        const newCount = prevCount + 1;
        localStorage.setItem("emailCount", newCount.toString());
        return newCount;
      });
    } else {
      setStatus(T.error);
    }
  };

  return {
    content,
    setField,
    status,
    handleRecaptchaChange,
    handleRecaptchaExpired,
    errors,
    emailCount,
    sendEmail,
  };
};

export default useEmailForm;
